import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getHeightAt, CHUNK_SIZE } from '../lib/procedural';
import { Player } from '../components/Player';
import { Snowman } from '../components/Enemies';
import { SnowEmperor } from '../components/SnowEmperor';
import { randomRange } from '../lib/utils';
import { EnemyInstance } from '../types';

const BOSS_SPAWN_Z = 1000; // Distance to boss

const TerrainChunk = ({ zOffset, enemiesRef }: { zOffset: number, enemiesRef: React.MutableRefObject<EnemyInstance[]> }) => {
  const mesh = useRef<THREE.Mesh>(null);

  // Generate geometry data once
  const { positions, indices, enemySpawns } = useMemo(() => {
    const segments = 20;
    const width = 40; // Path width
    const depth = CHUNK_SIZE;

    const positions = [];
    const indices = [];
    const enemySpawns = [];

    // Geometry generation
    for (let z = 0; z <= segments; z++) {
      for (let x = 0; x <= segments; x++) {
        const u = x / segments;
        const v = z / segments;

        const px = (u - 0.5) * width;
        const pz = (v - 0.5) * depth - zOffset; // -z goes forward

        // Apply height noise
        const py = getHeightAt(px, pz, 'open_slope'); // using default biome for now

        positions.push(px, py, pz);
      }
    }

    // Generate indices
    for (let z = 0; z < segments; z++) {
      for (let x = 0; x < segments; x++) {
        const a = z * (segments + 1) + x;
        const b = (z + 1) * (segments + 1) + x;
        const c = (z + 1) * (segments + 1) + x + 1;
        const d = z * (segments + 1) + x + 1;

        // Two triangles per quad
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Generate Enemies randomly for this chunk
    const enemyCount = Math.floor(randomRange(1, 4));
    for(let i=0; i<enemyCount; i++) {
        const ex = randomRange(-10, 10);
        const ez = -zOffset - randomRange(10, CHUNK_SIZE - 10);
        const ey = getHeightAt(ex, ez, 'open_slope');
        enemySpawns.push({ position: [ex, ey, ez] as [number, number, number], id: `${zOffset}-${i}` });
    }

    return {
        positions: new Float32Array(positions),
        indices: indices,
        enemySpawns
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
            <meshStandardMaterial
                color="#F8FAFC"
                roughness={0.8}
                flatShading
            />
        </mesh>
        {enemySpawns.map(spawn => (
            <Snowman
                key={spawn.id}
                position={spawn.position}
                onRegister={(instance) => {
                     enemiesRef.current.push(instance);
                     return () => {
                         enemiesRef.current = enemiesRef.current.filter(e => e !== instance);
                     };
                }}
            />
        ))}
    </group>
  );
};

export const MountainScene = () => {
    // Chunk management
    const [chunks, setChunks] = useState<number[]>([0, CHUNK_SIZE, CHUNK_SIZE * 2]);
    const { camera } = useThree();
    const lastChunkRef = useRef(CHUNK_SIZE * 2);
    const enemiesRef = useRef<EnemyInstance[]>([]);

    useFrame(() => {
        // Player moves in -Z
        // If camera passes a threshold, shift chunks
        const z = camera.position.z;
        const forwardEdge = z - CHUNK_SIZE * 2;

        // If we need a new chunk
        if (lastChunkRef.current > Math.abs(forwardEdge)) {
            // This logic is a bit tricky with negative coordinates.
            // Let's simplify: camera.z starts at 10 and goes down.
            // Chunks start at 0, 200, 400 (positive offset in my code logic means negative world Z)
            // Wait, TerrainChunk uses `pz = ... - zOffset`.
            // So offset 0 = 0 to -200.
            // Offset 200 = -200 to -400.
            // Camera z goes 10 -> 0 -> -100 -> ...

            // Check if we are approaching the end of the current set
            const currentFurthestChunk = chunks[chunks.length - 1];
            // -currentFurthestChunk is the start of that chunk.
            // We want to spawn the NEXT one when we get close.

            if (Math.abs(z) > currentFurthestChunk - CHUNK_SIZE) {
                const newChunk = currentFurthestChunk + CHUNK_SIZE;
                setChunks(prev => [...prev.slice(1), newChunk]);
                lastChunkRef.current = newChunk;
            }
        }
    });

    return (
        <group>
            <Player enemiesRef={enemiesRef} />
            {chunks.map(offset => (
                <TerrainChunk key={offset} zOffset={offset} enemiesRef={enemiesRef} />
            ))}
            {/* Boss Spawn */}
            <SnowEmperor position={[0, 0, -BOSS_SPAWN_Z]} />
        </group>
    );
};
