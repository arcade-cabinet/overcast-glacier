import {
  ArcRotateCamera,
  Color3,
  Color4,
  HemisphericLight,
  type Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { EngineView, useEngine } from "@babylonjs/react-native";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { type Entity, world } from "../ecs/world";
import {
  type BiomeType,
  CHUNK_SIZE,
  getBiomeAt,
  getBiomeColor,
  getHeightAt,
} from "../lib/procedural";
import { RNG } from "../lib/rng";
import { useGameStore } from "../stores/useGameStore";
import type { EnemyType } from "../types";

const VISIBLE_CHUNKS = 5;

interface TerrainChunk {
  mesh: ReturnType<typeof MeshBuilder.CreateGround>;
  zPosition: number;
  biome: BiomeType;
  entities: Entity[];
}

export const GameScene: React.FC = () => {
  const engine = useEngine();
  const sceneRef = useRef<Scene | null>(null);
  const chunksRef = useRef<TerrainChunk[]>([]);
  const playerZRef = useRef(0);

  const setGameState = useGameStore((state) => state.setGameState);

  // Create a terrain chunk
  const createChunk = useCallback(
    (scene: Scene, chunkIndex: number): TerrainChunk => {
      const zPosition = chunkIndex * CHUNK_SIZE;
      // Sample biome at the center of the chunk
      const biome = getBiomeAt(zPosition + CHUNK_SIZE / 2);

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
          const localZ = positions[i + 2];
          const worldZ = localZ + zPosition + CHUNK_SIZE / 2;

          positions[i + 1] = getHeightAt(x, worldZ, biome);
        }
        ground.updateVerticesData("position", positions);
        ground.refreshBoundingInfo();
      }

      // Position chunk
      ground.position.z = zPosition + CHUNK_SIZE / 2;

      // Apply biome material
      const material = new StandardMaterial(`mat_${chunkIndex}`, scene);
      const hexColor = getBiomeColor(biome);
      material.diffuseColor = Color3.FromHexString(hexColor);
      material.specularColor = new Color3(0.1, 0.1, 0.1);
      material.emissiveColor = material.diffuseColor.scale(0.1);
      ground.material = material;
      ground.receiveShadows = true;

      // --- Entity Spawning ---
      const entities: Entity[] = [];
      const chunkSeed = 42 + chunkIndex * 1337;
      const chunkRNG = new RNG(chunkSeed);

      // Don't spawn enemies on the first chunk or summit
      if (chunkIndex > 0 && biome !== "summit") {
        const enemyCount = chunkRNG.rangeInt(2, 6);

        for (let i = 0; i < enemyCount; i++) {
          const ex = chunkRNG.range(-15, 15);
          // Local Z relative to chunk start.
          // chunk ranges from zPosition to zPosition + CHUNK_SIZE.
          // We want to spawn within the chunk.
          const ezLocal = chunkRNG.range(10, CHUNK_SIZE - 10);
          const ez = zPosition + ezLocal;
          const ey = getHeightAt(ex, ez, biome);

          let type: EnemyType = "snowman";

          if (biome === "ice_cave")
            type = chunkRNG.chance(0.4) ? "glitch_imp" : "snowman";
          else if (biome === "frozen_rink") type = "snowman";
          else {
            if (chunkRNG.chance(0.1)) type = "glitch_imp";
            else if (chunkRNG.chance(0.3)) type = "polar_bear";
          }

          // Create mesh for entity
          let mesh: Mesh;
          if (type === "snowman") {
            mesh = MeshBuilder.CreateSphere(
              `enemy_${chunkIndex}_${i}`,
              { diameter: 1 },
              scene,
            );
            const mat = new StandardMaterial("snowmanMat", scene);
            mat.diffuseColor = Color3.White();
            mesh.material = mat;
          } else if (type === "polar_bear") {
            mesh = MeshBuilder.CreateBox(
              `enemy_${chunkIndex}_${i}`,
              { size: 1.5 },
              scene,
            );
            const mat = new StandardMaterial("bearMat", scene);
            mat.diffuseColor = Color3.Gray();
            mesh.material = mat;
          } else {
            // Glitch imp
            mesh = MeshBuilder.CreatePolyhedron(
              `enemy_${chunkIndex}_${i}`,
              { type: 1, size: 0.5 },
              scene,
            );
            const mat = new StandardMaterial("impMat", scene);
            mat.diffuseColor = Color3.Purple();
            mat.emissiveColor = Color3.Purple();
            mesh.material = mat;
          }

          mesh.position = new Vector3(ex, ey + 1, ez);

          const entity = world.add({
            tag: "enemy",
            position: mesh.position, // Link position
            velocity: new Vector3(0, 0, 0),
            gravity: true,
            radius: 1.0,
            enemyType: type,
            mesh: mesh,
          });

          entities.push(entity);
        }

        // Spawn Cocoa (Collectible)
        if (biome === "cocoa_valley" || chunkRNG.chance(0.2)) {
          const cx = chunkRNG.range(-10, 10);
          const czLocal = chunkRNG.range(10, CHUNK_SIZE - 10);
          const cz = zPosition + czLocal;
          const cy = getHeightAt(cx, cz, biome);

          const mesh = MeshBuilder.CreateCylinder(
            `cocoa_${chunkIndex}`,
            { diameter: 0.8, height: 1 },
            scene,
          );
          const mat = new StandardMaterial("cocoaMat", scene);
          mat.diffuseColor = Color3.Red(); // Cup color
          mesh.material = mat;
          mesh.position = new Vector3(cx, cy + 1, cz);

          const entity = world.add({
            tag: "collectible",
            position: mesh.position,
            radius: 0.8,
            collectibleType: "cocoa",
            mesh: mesh,
          });
          entities.push(entity);
        }
      }

      return { mesh: ground, zPosition, biome, entities };
    },
    [],
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
            // Remove entities from world
            if (oldChunk) {
              for (const entity of oldChunk.entities) {
                // Dispose mesh if it exists
                if (entity.mesh) {
                  entity.mesh.dispose(false, true);
                }
                world.remove(entity);
              }
              oldChunk.mesh.dispose(false, true);
            }
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
      world.clear();
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
