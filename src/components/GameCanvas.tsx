import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { MountainScene } from '../scenes/MountainScene';
import { Stars, Cloud } from '@react-three/drei';

export const GameCanvas = () => {
  return (
    <div className="h-full w-full bg-primary relative">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
        dpr={[1, 2]} // Optimize for mobile
      >
        <Suspense fallback={null}>
            <ambientLight intensity={0.5} color="#7DD3FC" />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />

            {/* Environment Effects */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Cloud position={[0, 10, -20]} opacity={0.5} />

            <MountainScene />
        </Suspense>
      </Canvas>
    </div>
  );
};
