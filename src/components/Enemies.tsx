import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { EnemyInstance } from "../types";

interface EnemyProps {
  entity: { position: THREE.Vector3; velocity: THREE.Vector3 }; // ECS Entity reference
  onRegister: (instance: EnemyInstance) => () => void;
}

// --- SNOWMAN ---
export const Snowman = ({ entity, onRegister }: EnemyProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const instance: EnemyInstance = {
      id: crypto.randomUUID(),
      position: entity.position,
      type: "snowman",
      hit: () => {
        setActive(false);
      },
    };
    return onRegister(instance);
  }, [active, onRegister, entity.position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;

    // Rotation based on movement
    if (Math.abs(entity.velocity.x) > 0.1) {
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y,
        entity.velocity.x > 0 ? Math.PI : 0,
        0.1,
      );
      // Rolling wobble
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
    } else {
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={[0, 0, 0]}>
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
export const PolarBear = ({ entity, onRegister }: EnemyProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const instance: EnemyInstance = {
      id: crypto.randomUUID(),
      position: entity.position,
      type: "polar_bear",
      hit: () => {
        setActive(false);
      },
    };
    return onRegister(instance);
  }, [active, onRegister, entity.position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;

    // Look at movement direction
    if (Math.abs(entity.velocity.x) > 0.1) {
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y,
        entity.velocity.x > 0 ? Math.PI / 2 : -Math.PI / 2,
        0.1,
      );
    }

    // Breathing / Roaring animation
    mesh.current.scale.setScalar(
      1 + Math.sin(state.clock.elapsedTime * 2) * 0.05,
    );
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={[0, 0, 0]}>
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
export const GlitchImp = ({ entity, onRegister }: EnemyProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const instance: EnemyInstance = {
      id: crypto.randomUUID(),
      position: entity.position,
      type: "glitch_imp",
      hit: () => {
        setActive(false);
      },
    };
    return onRegister(instance);
  }, [active, onRegister, entity.position]);

  useFrame((state) => {
    if (!active || !mesh.current) return;
    // Erratic movement (visual only offset)
    mesh.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
    mesh.current.rotation.x += 0.1;
    mesh.current.rotation.y += 0.2;
  });

  if (!active) return null;

  return (
    <group ref={mesh} position={[0, 0, 0]}>
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
