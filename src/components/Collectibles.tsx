import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CollectibleInstance } from '../types';

export const HotCocoa = ({ position, onRegister }: { position: [number, number, number], onRegister: (c: CollectibleInstance) => () => void }) => {
    const mesh = useRef<THREE.Group>(null);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (!active) return;
        const instance: CollectibleInstance = {
            id: Math.random().toString(),
            position: new THREE.Vector3(...position),
            type: 'cocoa',
            collect: () => setActive(false)
        };
        return onRegister(instance);
    }, [active, onRegister, position]);

    useFrame((state) => {
        if (!active || !mesh.current) return;
        mesh.current.rotation.y += 0.02;
        mesh.current.position.y = position[1] + 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    });

    if (!active) return null;

    return (
        <group ref={mesh} position={position}>
            {/* Mug */}
            <mesh castShadow>
                <cylinderGeometry args={[0.3, 0.25, 0.5]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Handle */}
            <mesh position={[0.25, 0, 0]} rotation={[0, 0, 1.57]}>
                <torusGeometry args={[0.15, 0.05, 8, 16, 3.14]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Steam Particles (Simple boxes) */}
            <mesh position={[0, 0.4, 0]}>
                 <boxGeometry args={[0.1, 0.1, 0.1]} />
                 <meshBasicMaterial color="white" opacity={0.5} transparent />
            </mesh>
        </group>
    );
};
