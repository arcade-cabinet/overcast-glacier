import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyInstance } from '../types';

interface SnowballProps {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    enemiesRef: React.MutableRefObject<EnemyInstance[]>;
    onHit: () => void;
}

export const Snowball = ({ position, velocity, enemiesRef, onHit }: SnowballProps) => {
    const mesh = useRef<THREE.Mesh>(null);
    const pos = useRef(position.clone());
    const vel = useRef(velocity.clone());
    const active = useRef(true);

    useFrame((state, delta) => {
        if (!active.current || !mesh.current) return;

        // Physics
        vel.current.y -= 9.8 * delta; // Gravity
        pos.current.addScaledVector(vel.current, delta);

        mesh.current.position.copy(pos.current);

        // Collision with ground (approximate)
        if (pos.current.y < -10) { // arbitrary floor
            active.current = false;
            onHit();
        }

        // Collision with Enemies
        if (enemiesRef.current) {
            for (const enemy of enemiesRef.current) {
                if (pos.current.distanceTo(enemy.position) < 1.0) {
                    enemy.hit();
                    active.current = false;
                    onHit();
                    break;
                }
            }
        }
    });

    if (!active.current) return null;

    return (
        <mesh ref={mesh} position={position}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="white" />
        </mesh>
    );
};
