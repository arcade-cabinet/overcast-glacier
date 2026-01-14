import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";

export const SnowEmperor = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const group = useRef<THREE.Group>(null);
  const [phase, _setPhase] = useState(1);
  const [health, _setHealth] = useState(100);
  const _addScore = useGameStore((state) => state.addScore);

  // Floating animation
  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

    // Base movement
    group.current.position.y = position[1] + Math.sin(time) * 2;
    group.current.rotation.y += 0.005;

    // Phase behavior
    if (phase === 2) {
      // Agitated shake
      group.current.position.x = position[0] + Math.sin(time * 10) * 0.5;
    } else if (phase === 3) {
      // Glitchy Teleport (Visual only for now)
      if (Math.random() > 0.95) {
        group.current.position.x = (Math.random() - 0.5) * 10;
      }
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Health Bar (World Space) */}
      <mesh position={[0, 12, 0]}>
        <planeGeometry args={[10, 1]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[-5 + health / 20, 12, 0.1]}>
        <planeGeometry args={[health / 10, 0.8]} />
        <meshBasicMaterial color={health > 50 ? "#10B981" : "#EF4444"} />
      </mesh>

      {/* Throne Base */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5, 6, 2, 8]} />
        <meshStandardMaterial color="#1E40AF" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* The Emperor Body (Glitchy Ice) */}
      <mesh position={[0, 5, 0]} castShadow>
        <dodecahedronGeometry args={[3 + phase * 0.5, 0]} />
        <meshStandardMaterial
          color={phase === 3 ? "#EF4444" : "#7DD3FC"}
          emissive={phase === 3 ? "#7F1D1D" : "#7DD3FC"}
          emissiveIntensity={0.5}
          wireframe={phase === 3}
        />
      </mesh>

      {/* Core */}
      <mesh position={[0, 5, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Floating Shards (Attack telegraphs) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          // biome-ignore lint/suspicious/noArrayIndexKey: Static content
          key={i}
          position={[
            Math.cos(i) * (6 + phase),
            Math.sin(i) * (6 + phase) + 5,
            0,
          ]}
        >
          <tetrahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#60A5FA" />
        </mesh>
      ))}
    </group>
  );
};
