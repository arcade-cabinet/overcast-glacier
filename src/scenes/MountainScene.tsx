import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SnowEmperor } from "../components/SnowEmperor";
import { world } from "../ecs/world";
import {
  CHUNK_SIZE,
  getBiomeAt,
  getBiomeColor,
  getHeightAt,
} from "../lib/procedural";
import { randomRange } from "../lib/utils";
import type { EnemyType } from "../types";

const BOSS_SPAWN_Z = 1000; // Distance to boss

const TerrainChunk = ({ zOffset }: { zOffset: number }) => {
  const mesh = useRef<THREE.Mesh>(null);

  const { positions, indices, biomeColor } = useMemo(() => {
    const segments = 20;
    const width = 40;
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
        const pz = (v - 0.5) * depth - zOffset;
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
    };
  }, [zOffset]);

  // SPAWN ENTITIES ON MOUNT (Once)
  useEffect(() => {
    const centerZ = -zOffset - CHUNK_SIZE / 2;
    const biome = getBiomeAt(centerZ);

    const entities = [];
    const enemyCount = Math.floor(randomRange(1, 5));

    for (let i = 0; i < enemyCount; i++) {
      const ex = randomRange(-10, 10);
      const ez = -zOffset - randomRange(10, CHUNK_SIZE - 10);
      const ey = getHeightAt(ex, ez, biome);

      let type: EnemyType = "snowman";
      const r = Math.random();
      if (biome === "ice_cave") type = r > 0.4 ? "glitch_imp" : "snowman";
      else if (biome === "cocoa_valley")
        type = r > 0.3 ? "polar_bear" : "snowman";
      else if (biome === "summit") type = r > 0.5 ? "glitch_imp" : "polar_bear";
      else {
        if (r > 0.9) type = "glitch_imp";
        else if (r > 0.8) type = "polar_bear";
        else type = "snowman";
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

    if (biome === "cocoa_valley" || Math.random() > 0.7) {
      const cx = randomRange(-8, 8);
      const cz = -zOffset - randomRange(10, CHUNK_SIZE - 10);
      const cy = getHeightAt(cx, cz, biome);

      const entity = world.add({
        tag: "collectible",
        position: new THREE.Vector3(cx, cy, cz),
        radius: 0.5,
        collectibleType: "cocoa",
      });
      entities.push(entity);
    }

    return () => {
      for (const e of entities) world.remove(e);
    };
  }, [zOffset]);

  return (
    <group>
      <mesh ref={mesh} receiveShadow>
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
            array={new Uint16Array(indices)}
            itemSize={1}
          />
        </bufferGeometry>
        <meshStandardMaterial color={biomeColor} roughness={0.8} flatShading />
      </mesh>
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
    const forwardEdge = z - CHUNK_SIZE * 2;

    if (lastChunkRef.current > Math.abs(forwardEdge)) {
      const currentFurthestChunk = chunks[chunks.length - 1];
      if (Math.abs(z) > currentFurthestChunk - CHUNK_SIZE) {
        const newChunk = currentFurthestChunk + CHUNK_SIZE;
        setChunks((prev) => [...prev.slice(1), newChunk]);
        lastChunkRef.current = newChunk;
      }
    }
  });

  return (
    <group>
      {chunks.map((offset) => (
        <TerrainChunk key={offset} zOffset={offset} />
      ))}
      <SnowEmperor position={[0, 0, -BOSS_SPAWN_Z]} />
    </group>
  );
};
