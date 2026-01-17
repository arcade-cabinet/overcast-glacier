import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SnowEmperor } from "../components/SnowEmperor";
import { type Entity, world } from "../ecs/world";
import {
  CHUNK_SIZE,
  getBiomeAt,
  getBiomeColor,
  getHeightAt,
} from "../lib/procedural";
import { RNG } from "../lib/rng"; // Import RNG class
import type { EnemyType } from "../types";

const BOSS_SPAWN_Z = 1000;

const TerrainChunk = ({ zOffset }: { zOffset: number }) => {
  const mesh = useRef<THREE.Mesh>(null);

  const { positions, indices, biomeColor, biome } = useMemo(() => {
    const segments = 32;
    const width = 60;
    const depth = CHUNK_SIZE;

    const positions = [];
    const indices = [];

    const centerZ = -zOffset - depth / 2;
    const biome = getBiomeAt(centerZ);

    for (let z = 0; z <= segments; z++) {
      for (let x = 0; x <= segments; x++) {
        const u = x / segments;
        const v = z / segments;

        const px = (u - 0.5) * width;
        const pz = v * -depth - zOffset;
        const py = getHeightAt(px, pz, biome);

        positions.push(px, py, pz);
      }
    }

    for (let z = 0; z < segments; z++) {
      for (let x = 0; x < segments; x++) {
        const a = z * (segments + 1) + x;
        const b = (z + 1) * (segments + 1) + x;
        const c = (z + 1) * (segments + 1) + x + 1;
        const d = z * (segments + 1) + x + 1;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    return {
      positions: new Float32Array(positions),
      indices: indices,
      biomeColor: getBiomeColor(biome),
      biome,
    };
  }, [zOffset]);

  // SPAWN ENTITIES
  useEffect(() => {
    // Re-seed RNG based on chunk position to ensure deterministic spawning per chunk
    // This allows re-visiting chunks (if we did that) to have same enemies,
    // and ensures consistency across renders if useEffect re-runs
    const chunkSeed = Math.floor(Math.abs(zOffset));
    const chunkRNG = new RNG(chunkSeed);

<<<<<<< HEAD
    interface Entity {
      tag: string;
      enemyType?: string;
      position: { x: number; y: number; z: number };
      velocity: { x: number; y: number; z: number };
      health?: number;
    }
=======
>>>>>>> origin/main
    const entities: Entity[] = [];
    const enemyCount = biome === "summit" ? 0 : chunkRNG.rangeInt(2, 6);

    for (let i = 0; i < enemyCount; i++) {
      const ex = chunkRNG.range(-15, 15);
      const ez = -zOffset - chunkRNG.range(10, CHUNK_SIZE - 10);
      const ey = getHeightAt(ex, ez, biome);

      let type: EnemyType = "snowman";

      if (biome === "ice_cave")
        type = chunkRNG.chance(0.4) ? "glitch_imp" : "snowman";
      else if (biome === "frozen_rink") type = "snowman";
      else {
        if (chunkRNG.chance(0.1)) type = "glitch_imp";
        else if (chunkRNG.chance(0.3)) type = "polar_bear";
      }

      const entity = world.add({
        tag: "enemy",
        position: new THREE.Vector3(ex, ey, ez),
        velocity: new THREE.Vector3(0, 0, 0),
        gravity: true,
        radius: 1.0,
        enemyType: type,
      });
      entities.push(entity);
    }

    // Spawn Cocoa
    if (biome === "cocoa_valley" || chunkRNG.chance(0.2)) {
      const cx = chunkRNG.range(-10, 10);
      const cz = -zOffset - chunkRNG.range(10, CHUNK_SIZE - 10);
      const cy = getHeightAt(cx, cz, biome);

      const entity = world.add({
        tag: "collectible",
        position: new THREE.Vector3(cx, cy, cz),
        radius: 0.8,
        collectibleType: "cocoa",
      });
      entities.push(entity);
    }

    return () => {
      for (const e of entities) world.remove(e);
    };
  }, [zOffset, biome]);

  return (
    <group>
      <mesh ref={mesh} receiveShadow castShadow>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            array={new Uint32Array(indices)}
            itemSize={1}
          />
        </bufferGeometry>
        <meshStandardMaterial
          color={biomeColor}
          roughness={0.8}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Visual Glitch Shards for Ice Cave */}
      {biome === "ice_cave" && (
        <group position={[0, 0, -zOffset - CHUNK_SIZE / 2]}>
          {/* Add some procedural icicles here if needed */}
        </group>
      )}
    </group>
  );
};

export const MountainScene = () => {
  const [chunks, setChunks] = useState<number[]>([
    0,
    CHUNK_SIZE,
    CHUNK_SIZE * 2,
  ]);
  const { camera } = useThree();
  const lastChunkRef = useRef(CHUNK_SIZE * 2);

  useFrame(() => {
    const z = camera.position.z;
    const forwardEdge = -lastChunkRef.current;

    if (z < forwardEdge + CHUNK_SIZE) {
      const nextOffset = lastChunkRef.current + CHUNK_SIZE;
      setChunks((prev) => [...prev.slice(1), nextOffset]);
      lastChunkRef.current = nextOffset;
    }
  });

  return (
    <group>
      {chunks.map((offset) => (
        <TerrainChunk key={offset} zOffset={offset} />
      ))}
      <SnowEmperor position={[0, -BOSS_SPAWN_Z * 0.1, -BOSS_SPAWN_Z]} />
    </group>
  );
};
