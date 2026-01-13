import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getHeightAt, getBiomeAt, getBiomeColor, CHUNK_SIZE } from '../lib/procedural';
import { Player } from '../components/Player';
import { Snowman, PolarBear, GlitchImp } from '../components/Enemies';
import { HotCocoa } from '../components/Collectibles';
import { SnowEmperor } from '../components/SnowEmperor';
import { randomRange } from '../lib/utils';
import { EnemyInstance, EnemyType, CollectibleInstance } from '../types';

const BOSS_SPAWN_Z = 1000; // Distance to boss

interface ChunkProps {
    zOffset: number;
    enemiesRef: React.MutableRefObject<EnemyInstance[]>;
    collectiblesRef: React.MutableRefObject<CollectibleInstance[]>;
}

const TerrainChunk = ({ zOffset, enemiesRef, collectiblesRef }: ChunkProps) => {
  const mesh = useRef<THREE.Mesh>(null);

  // Generate geometry data once
  const { positions, indices, enemySpawns, collectibleSpawns, biomeColor } = useMemo(() => {
    const segments = 20;
    const width = 40; // Path width
    const depth = CHUNK_SIZE;

    const positions = [];
    const indices = [];
    const enemySpawns = [];
    const collectibleSpawns = [];

    // Determine Biome for this chunk center
    // -zOffset is the start z (e.g. 0, -200, -400)
    // Center is -zOffset - depth/2
    const centerZ = -zOffset - depth/2;
    const biome = getBiomeAt(centerZ);

    // Geometry generation
    for (let z = 0; z <= segments; z++) {
      for (let x = 0; x <= segments; x++) {
        const u = x / segments;
        const v = z / segments;

        const px = (u - 0.5) * width;
        const pz = (v - 0.5) * depth - zOffset; // -z goes forward

        // Apply height noise
        const py = getHeightAt(px, pz, biome);

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
        const ey = getHeightAt(ex, ez, biome);

        // Pick Enemy Type based on Biome
        let type: EnemyType = 'snowman';
        const r = Math.random();

        if (biome === 'ice_cave') {
            type = r > 0.4 ? 'glitch_imp' : 'snowman';
        } else if (biome === 'cocoa_valley') {
            type = r > 0.3 ? 'polar_bear' : 'snowman';
        } else if (biome === 'summit') {
            type = r > 0.5 ? 'glitch_imp' : 'polar_bear';
        } else {
            // Open slope etc
            if (r > 0.8) type = 'polar_bear';
            else if (r > 0.9) type = 'glitch_imp';
            else type = 'snowman';
        }

        enemySpawns.push({
            position: [ex, ey, ez] as [number, number, number],
            id: `${zOffset}-${i}`,
            type
        });
    }

    // Generate Collectibles
    // Cocoa mostly in Cocoa Valley, rarely elsewhere
    if (biome === 'cocoa_valley' || Math.random() > 0.7) {
        const cx = randomRange(-8, 8);
        const cz = -zOffset - randomRange(10, CHUNK_SIZE - 10);
        const cy = getHeightAt(cx, cz, biome);
        collectibleSpawns.push({
             position: [cx, cy, cz] as [number, number, number],
             id: `c-${zOffset}`,
             type: 'cocoa' as const
        });
    }

    return {
        positions: new Float32Array(positions),
        indices: indices,
        enemySpawns,
        collectibleSpawns,
        biomeColor: getBiomeColor(biome)
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
                color={biomeColor}
                roughness={0.8}
                flatShading
            />
        </mesh>
        {enemySpawns.map(spawn => {
            const commonProps = {
                key: spawn.id,
                position: spawn.position,
                onRegister: (instance: EnemyInstance) => {
                     enemiesRef.current.push(instance);
                     return () => {
                         enemiesRef.current = enemiesRef.current.filter(e => e !== instance);
                     };
                }
            };

            if (spawn.type === 'polar_bear') return <PolarBear {...commonProps} />;
            if (spawn.type === 'glitch_imp') return <GlitchImp {...commonProps} />;
            return <Snowman {...commonProps} />;
        })}

        {collectibleSpawns.map(spawn => (
            <HotCocoa
                key={spawn.id}
                position={spawn.position}
                onRegister={(instance: CollectibleInstance) => {
                    collectiblesRef.current.push(instance);
                    return () => {
                        collectiblesRef.current = collectiblesRef.current.filter(c => c !== instance);
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
    const collectiblesRef = useRef<CollectibleInstance[]>([]);

    useFrame(() => {
        // Player moves in -Z
        // If camera passes a threshold, shift chunks
        const z = camera.position.z;
        const forwardEdge = z - CHUNK_SIZE * 2;

        // If we need a new chunk
        if (lastChunkRef.current > Math.abs(forwardEdge)) {
            // Check if we are approaching the end of the current set
            const currentFurthestChunk = chunks[chunks.length - 1];

            if (Math.abs(z) > currentFurthestChunk - CHUNK_SIZE) {
                const newChunk = currentFurthestChunk + CHUNK_SIZE;
                setChunks(prev => [...prev.slice(1), newChunk]);
                lastChunkRef.current = newChunk;
            }
        }
    });

    return (
        <group>
            <Player enemiesRef={enemiesRef} collectiblesRef={collectiblesRef} />
            {chunks.map(offset => (
                <TerrainChunk
                    key={offset}
                    zOffset={offset}
                    enemiesRef={enemiesRef}
                    collectiblesRef={collectiblesRef}
                />
            ))}
            {/* Boss Spawn */}
            <SnowEmperor position={[0, 0, -BOSS_SPAWN_Z]} />
        </group>
    );
};
