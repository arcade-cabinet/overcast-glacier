import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { MountainScene } from '../scenes/MountainScene';
import { Stars, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Vignette } from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';

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

            {/* Post Processing */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                <Vignette eskil={false} offset={0.1} darkness={0.5} />
                {/* Subtle Glitch occasionally */}
                <Glitch
                    delay={[5, 10]}
                    duration={[0.1, 0.3]}
                    strength={[0.1, 0.2]}
                    mode={GlitchMode.SPORADIC}
                    active
                    ratio={0.85}
                />
            </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
