import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';
import { clamp, lerp } from '../lib/utils';
import { getHeightAt } from '../lib/procedural';
import { EnemyInstance } from '../types';

export const Player = ({ enemiesRef }: { enemiesRef?: React.MutableRefObject<EnemyInstance[]> }) => {
  const mesh = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const decreaseWarmth = useGameStore((state) => state.decreaseWarmth);
  const addScore = useGameStore((state) => state.addScore);

  // Physics state
  const velocity = useRef(new THREE.Vector3(0, 0, -10)); // Moving forward
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const isJumping = useRef(false);
  const isCrouching = useRef(false);

  // Input state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true;
    const onKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;

    // Touch handling placeholder
    const onTouchStart = (e: TouchEvent) => {
        // Simple logic: tap right/left side
        const x = e.touches[0].clientX;
        if (x > window.innerWidth / 2) keys.current['ArrowRight'] = true;
        else keys.current['ArrowLeft'] = true;
    };
    const onTouchEnd = () => {
        keys.current['ArrowRight'] = false;
        keys.current['ArrowLeft'] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    const dt = Math.min(delta, 0.1);

    // Input handling
    const speed = 20; // lateral speed
    let targetX = position.current.x;

    if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
        targetX -= speed * dt;
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) {
        targetX += speed * dt;
    }

    // Smooth lateral movement
    position.current.x = lerp(position.current.x, targetX, dt * 5);
    position.current.x = clamp(position.current.x, -18, 18); // Stay on track

    // Forward movement (always moving)
    position.current.z += velocity.current.z * dt;

    // Terrain Following
    // We need to know the height at current x, z
    const terrainHeight = getHeightAt(position.current.x, position.current.z, 'open_slope');

    // Jump logic
    if (keys.current['Space'] || keys.current['ArrowUp']) {
        if (!isJumping.current && position.current.y <= terrainHeight + 0.5) {
            velocity.current.y = 10;
            isJumping.current = true;
        }
    }

    // Gravity
    if (position.current.y > terrainHeight) {
        velocity.current.y -= 30 * dt;
    } else {
        velocity.current.y = 0;
        position.current.y = terrainHeight;
        isJumping.current = false;
    }

    position.current.y += velocity.current.y * dt;

    // Update mesh
    mesh.current.position.copy(position.current);

    // Camera Follow
    const cameraTargetPos = new THREE.Vector3(
        position.current.x * 0.5, // Slight lateral follow
        position.current.y + 5,
        position.current.z + 10
    );
    camera.position.lerp(cameraTargetPos, dt * 5);
    camera.lookAt(position.current.x, position.current.y, position.current.z - 5);

    // Update Game Store
    if (state.clock.elapsedTime % 1 < dt) { // roughly once per second
        decreaseWarmth(1);
    }
    addScore(Math.abs(velocity.current.z * dt)); // Score based on distance

    // Combat / Collision
    if (enemiesRef && enemiesRef.current) {
        enemiesRef.current.forEach(enemy => {
            const dist = position.current.distanceTo(enemy.position);
            if (dist < 1.5) {
                // Combat logic
                // If kicking/jumping, kill enemy
                // For now, auto-kill on contact for testing, or simple bump
                enemy.hit();
                addScore(100);
            }
        });
    }

    // Rotation for flair
    mesh.current.rotation.y = lerp(mesh.current.rotation.y, (targetX - position.current.x) * -0.1, dt * 5);
  });

  return (
    <group ref={mesh}>
        {/* Placeholder Kitten */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="white" />
        </mesh>
        {/* Flip Phone Antenna */}
        <mesh position={[0.4, 1, -0.2]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="black" />
        </mesh>
        {/* Glitch Particles (simple) */}
    </group>
  );
};
