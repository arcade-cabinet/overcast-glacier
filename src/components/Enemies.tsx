import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyInstance, EnemyType } from '../types';

interface EnemyProps {
    position: [number, number, number];
    onRegister: (instance: EnemyInstance) => () => void;
}

// --- SNOWMAN ---
export const Snowman = ({ position, onRegister }: EnemyProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const instance: EnemyInstance = {
        id: Math.random().toString(),
        position: new THREE.Vector3(...position),
        type: 'snowman',
        hit: () => { setActive(false); }
    };
    return onRegister(instance);
  }, [active, onRegister, position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;
    mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.1;
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="white" />
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

// --- POLAR BEAR ---
export const PolarBear = ({ position, onRegister }: EnemyProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const instance: EnemyInstance = {
        id: Math.random().toString(),
        position: new THREE.Vector3(...position),
        type: 'polar_bear',
        hit: () => { setActive(false); }
    };
    return onRegister(instance);
  }, [active, onRegister, position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;
    // Breathing / Roaring animation
    mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={position}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1, 1.5, 2]} />
        <meshStandardMaterial color="#F0F9FF" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 0.8]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#F0F9FF" />
      </mesh>
      {/* Legs */}
      <mesh position={[0.4, 0, 0.8]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#E0F2FE" />
      </mesh>
      <mesh position={[-0.4, 0, 0.8]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#E0F2FE" />
      </mesh>
      <mesh position={[0.4, 0, -0.8]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#E0F2FE" />
      </mesh>
      <mesh position={[-0.4, 0, -0.8]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#E0F2FE" />
      </mesh>
    </group>
  );
};

// --- GLITCH IMP ---
export const GlitchImp = ({ position, onRegister }: EnemyProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const instance: EnemyInstance = {
        id: Math.random().toString(),
        position: new THREE.Vector3(...position),
        type: 'glitch_imp',
        hit: () => { setActive(false); }
    };
    return onRegister(instance);
  }, [active, onRegister, position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;
    // Erratic movement
    mesh.current.position.y = position[1] + 2 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
    mesh.current.rotation.x += 0.1;
    mesh.current.rotation.y += 0.2;
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={position}>
      <mesh castShadow>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#10B981" wireframe />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.2]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
    </group>
  );
};
