import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { GameRNG } from "../lib/rng";

export const GlobalSnow = () => {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: 15000 }, () => (GameRNG.next() - 0.5) * 100),
      ),
    [],
  );

  useFrame(() => {
    if (points.current) {
      points.current.rotation.y += 0.001;
      points.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={5000}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="white"
        opacity={0.8}
        transparent
        sizeAttenuation
      />
    </points>
  );
};
