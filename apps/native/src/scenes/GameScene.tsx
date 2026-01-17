import {
  ArcRotateCamera,
  Color3,
  Color4,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { EngineView, useEngine } from "@babylonjs/react-native";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { TerrainRNG } from "../lib/rng";
import { useGameStore } from "../stores/useGameStore";

// Biome color definitions (ported from web version)
const BIOME_COLORS = {
  open_slope: new Color3(0.97, 0.98, 1.0), // Snow white
  ice_cave: new Color3(0.49, 0.83, 0.99), // Ice blue
  frozen_rink: new Color3(0.72, 0.89, 0.99), // Light ice
  cocoa_valley: new Color3(0.55, 0.27, 0.07), // Cocoa brown
  summit: new Color3(0.87, 0.87, 0.87), // Gray rock
};

type BiomeType = keyof typeof BIOME_COLORS;

interface TerrainChunk {
  mesh: ReturnType<typeof MeshBuilder.CreateGround>;
  zPosition: number;
  biome: BiomeType;
}

const CHUNK_SIZE = 100;
const VISIBLE_CHUNKS = 5;

export const GameScene: React.FC = () => {
  const engine = useEngine();
  const sceneRef = useRef<Scene | null>(null);
  const chunksRef = useRef<TerrainChunk[]>([]);
  const playerZRef = useRef(0);

  const setGameState = useGameStore((state) => state.setGameState);

  // Determine biome based on z position using deterministic RNG
  const getBiomeForChunk = useCallback((chunkIndex: number): BiomeType => {
    // Reset RNG to consistent state for this chunk
    const chunkSeed = 42 + chunkIndex * 1337;
    TerrainRNG.reset(chunkSeed);

    const biomes: BiomeType[] = Object.keys(BIOME_COLORS) as BiomeType[];
    return TerrainRNG.pick(biomes);
  }, []);

  // Generate terrain height using simplex-like noise (simplified)
  const getTerrainHeight = useCallback((x: number, z: number): number => {
    // Simplified noise function for terrain
    const scale = 0.02;
    const height =
      Math.sin(x * scale) * Math.cos(z * scale) * 5 +
      Math.sin(x * scale * 2.5) * Math.cos(z * scale * 2.5) * 2;
    return height;
  }, []);

  // Create a terrain chunk
  const createChunk = useCallback(
    (scene: Scene, chunkIndex: number): TerrainChunk => {
      const zPosition = chunkIndex * CHUNK_SIZE;
      const biome = getBiomeForChunk(chunkIndex);

      const ground = MeshBuilder.CreateGround(
        `chunk_${chunkIndex}`,
        {
          width: CHUNK_SIZE,
          height: CHUNK_SIZE,
          subdivisions: 32,
          updatable: true,
        },
        scene,
      );

      // Apply height map
      const positions = ground.getVerticesData("position");
      if (positions) {
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2] + zPosition;
          positions[i + 1] = getTerrainHeight(x, z);
        }
        ground.updateVerticesData("position", positions);
        ground.refreshBoundingInfo();
      }

      // Position chunk
      ground.position.z = zPosition + CHUNK_SIZE / 2;

      // Apply biome material
      const material = new StandardMaterial(`mat_${chunkIndex}`, scene);
      material.diffuseColor = BIOME_COLORS[biome];
      material.specularColor = new Color3(0.1, 0.1, 0.1);
      material.emissiveColor = BIOME_COLORS[biome].scale(0.1);
      ground.material = material;
      ground.receiveShadows = true;

      return { mesh: ground, zPosition, biome };
    },
    [getBiomeForChunk, getTerrainHeight],
  );

  // Initialize scene when engine is available
  useEffect(() => {
    if (!engine) return;

    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Background color - Midnight arctic
    scene.clearColor = new Color4(0.06, 0.09, 0.16, 1);

    // Camera setup - isometric-ish view
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3,
      30,
      Vector3.Zero(),
      scene,
    );
    camera.lowerBetaLimit = Math.PI / 4;
    camera.upperBetaLimit = Math.PI / 2.5;

    // Hemispheric light for soft arctic lighting
    const light = new HemisphericLight("light", new Vector3(0, 1, -0.5), scene);
    light.intensity = 0.8;
    light.diffuse = new Color3(0.49, 0.83, 0.99); // Ice blue tint
    light.groundColor = new Color3(0.06, 0.09, 0.16); // Dark blue ground

    // Create initial terrain chunks
    for (let i = 0; i < VISIBLE_CHUNKS; i++) {
      const chunk = createChunk(scene, i);
      chunksRef.current.push(chunk);
    }

    // Create player placeholder (kitten)
    const player = MeshBuilder.CreateSphere("player", { diameter: 1 }, scene);
    player.position.y = 2;
    player.position.z = 0;

    const playerMat = new StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = new Color3(1, 0.8, 0.6); // Kitten orange
    playerMat.emissiveColor = new Color3(0.2, 0.16, 0.12);
    player.material = playerMat;

    // Game loop
    scene.onBeforeRenderObservable.add(() => {
      const currentGameState = useGameStore.getState().gameState;

      if (currentGameState === "playing") {
        // Move player forward
        player.position.z += 0.2;
        playerZRef.current = player.position.z;

        // Update camera to follow player
        camera.target.z = player.position.z;

        // Check if we need to generate new chunks
        const currentChunkIndex = Math.floor(player.position.z / CHUNK_SIZE);
        const lastChunk = chunksRef.current[chunksRef.current.length - 1];
        const lastChunkIndex = Math.floor(lastChunk.zPosition / CHUNK_SIZE);

        if (currentChunkIndex + VISIBLE_CHUNKS > lastChunkIndex + 1) {
          // Generate new chunk ahead
          const newChunk = createChunk(scene, lastChunkIndex + 1);
          chunksRef.current.push(newChunk);

          // Remove old chunk behind
          if (chunksRef.current.length > VISIBLE_CHUNKS + 2) {
            const oldChunk = chunksRef.current.shift();
            oldChunk?.mesh.dispose();
          }
        }
      }
    });

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Set game state to menu when scene is ready
    setGameState("menu");

    // Cleanup
    return () => {
      scene.dispose();
      chunksRef.current = [];
    };
  }, [engine, createChunk, setGameState]);

  return (
    <View style={styles.container}>
      <EngineView style={styles.engine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  engine: {
    flex: 1,
  },
});
