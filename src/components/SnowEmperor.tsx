import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";

export const SnowEmperor = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const group = useRef<THREE.Group>(null);
  const coreMesh = useRef<THREE.Mesh>(null);

  const bossHealth = useGameStore((state) => state.bossHealth);
  const bossPhase = useGameStore((state) => state.bossPhase);
  const _damageBoss = useGameStore((state) => state.damageBoss);
  const setBossPhase = useGameStore((state) => state.setBossPhase);
  const setGameState = useGameStore((state) => state.setGameState);

  // Floating shards logic
  const shardCount = 12;
  const shards = useMemo(() => Array.from({ length: shardCount }), []);

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

    // Update Phase based on health
    if (bossHealth <= 75 && bossPhase === 1) setBossPhase(2);
    if (bossHealth <= 50 && bossPhase === 2) setBossPhase(3);
    if (bossHealth <= 25 && bossPhase === 3) setBossPhase(4);
    if (bossHealth <= 0) setGameState("victory");

    // Base Floating & Rotation
    group.current.position.y = position[1] + Math.sin(time) * 1.5;
    group.current.rotation.y += 0.005 * bossPhase;

    // Core Animation
    if (coreMesh.current) {
      coreMesh.current.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
      if (bossPhase === 4) {
        coreMesh.current.position.x = Math.sin(time * 20) * 0.2;
      }
    }

    // Phase 2+ Agitated shake
    if (bossPhase >= 2) {
      group.current.position.x =
        position[0] + Math.sin(time * (bossPhase * 5)) * 0.2 * bossPhase;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Boss Core */}
      <mesh ref={coreMesh} position={[0, 5, 0]} castShadow>
        <dodecahedronGeometry args={[4, 0]} />
        <meshStandardMaterial
          color={bossPhase === 4 ? "#EF4444" : "#7DD3FC"}
          emissive={bossPhase >= 3 ? "#EF4444" : "#7DD3FC"}
          emissiveIntensity={bossPhase * 0.5}
          wireframe={bossPhase >= 3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Internal "Glitch" Core */}
      <mesh position={[0, 5, 0]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Floating Shards (Defensive/Attack Orbit) */}
      {shards.map((_, i) => (
        <Shard key={i} index={i} total={shardCount} phase={bossPhase} />
      ))}

      {/* Throne / Base */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[10, 12, 4, 8]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.1} metalness={0.5} />
      </mesh>
    </group>
  );
};

const Shard = ({
  index,
  total,
  phase,
}: {
  index: number;
  total: number;
  phase: number;
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const radius = 8 + Math.sin(time + index) * 1;
    const speed = time * (0.5 + phase * 0.2);

    mesh.current.position.x = Math.cos(angle + speed) * radius;
    mesh.current.position.z = Math.sin(angle + speed) * radius;
    mesh.current.position.y = 5 + Math.sin(time * 2 + index) * 2;

    mesh.current.rotation.x += 0.02;
    mesh.current.rotation.y += 0.03;
  });

  return (
    <mesh ref={mesh}>
      <tetrahedronGeometry args={[0.8]} />
      <meshStandardMaterial
        color={phase === 4 ? "#EF4444" : "#60A5FA"}
        emissive={phase === 4 ? "#7F1D1D" : "#000000"}
      />
    </mesh>
  );
};
