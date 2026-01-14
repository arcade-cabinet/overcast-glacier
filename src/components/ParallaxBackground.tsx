import { Cloud, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

export const ParallaxBackground = () => {
  const mountains = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (mountains.current) {
      // Mountains move slower than camera to create depth
      mountains.current.position.z = camera.position.z * 0.9;
      mountains.current.position.x = camera.position.x * 0.9;
    }
    if (clouds.current) {
      clouds.current.position.z = camera.position.z * 0.5;
      clouds.current.position.x = camera.position.x * 0.5;
    }
  });

  return (
    <group>
      {/* Distant Mountains */}
      <group ref={mountains} position={[0, -10, -100]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[(i - 2) * 50, 0, 0]}>
            <coneGeometry args={[30, 80, 4]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Clouds Layer */}
      <group ref={clouds} position={[0, 20, -50]}>
        <Cloud opacity={0.3} speed={0.1} segments={20} bounds={[20, 5, 5]} />
      </group>

      <Stars
        radius={200}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </group>
  );
};
