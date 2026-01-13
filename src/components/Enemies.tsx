import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyInstance } from '../types';

interface SnowmanProps {
    position: [number, number, number];
    onRegister: (instance: EnemyInstance) => () => void;
}

export const Snowman = ({ position, onRegister }: SnowmanProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  // Register with system
  useEffect(() => {
    if (!active) return;

    const instance: EnemyInstance = {
        id: Math.random().toString(),
        position: new THREE.Vector3(...position),
        type: 'snowman',
        hit: () => {
            setActive(false);
            // Spawn particles?
        }
    };

    const unregister = onRegister(instance);
    return () => unregister();
  }, [active, onRegister, position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;

    mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.1;
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Eyes (Glowing Code) */}
      <mesh position={[-0.1, 1.25, 0.25]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="#7DD3FC" />
      </mesh>
      <mesh position={[0.1, 1.25, 0.25]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="#7DD3FC" />
      </mesh>
      {/* Arms */}
      <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
       <mesh position={[-0.4, 0.8, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};
