import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SnowEmperor = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // Hover animation
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 2;
    // Rotate slowly
    group.current.rotation.y += 0.005;
  });

  return (
    <group ref={group} position={position}>
        {/* Throne Base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[5, 6, 2, 8]} />
            <meshStandardMaterial color="#1E40AF" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* The Emperor Body (Glitchy Ice) */}
        <mesh position={[0, 5, 0]} castShadow>
            <dodecahedronGeometry args={[3, 0]} />
            <meshStandardMaterial
                color="#7DD3FC"
                emissive="#7DD3FC"
                emissiveIntensity={0.5}
                wireframe
            />
        </mesh>

        {/* Core */}
        <mesh position={[0, 5, 0]}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="white" />
        </mesh>

        {/* Floating Shards */}
        {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[
                Math.cos(i) * 6,
                Math.sin(i) * 6 + 5,
                0
            ]}>
                <tetrahedronGeometry args={[0.5]} />
                <meshStandardMaterial color="#60A5FA" />
            </mesh>
        ))}
    </group>
  );
};
