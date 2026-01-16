import { Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense, useEffect } from "react";
import {
  CollectibleRenderer,
  EnemyRenderer,
  PlayerEntity,
} from "../ecs/entities";
import { AISystem, CollisionSystem, PhysicsSystem } from "../ecs/systems";
import { AudioSystem } from "../lib/audio/ProceduralAudio";
import { MountainScene } from "../scenes/MountainScene";
import { GlobalSnow } from "./GlobalSnow";
import { ParallaxBackground } from "./ParallaxBackground";
import { Resize } from "./Resize";
import { Loader } from "./UI/Loader";

export const GameCanvas = () => {
  useEffect(() => {
    const startAudio = () => {
      AudioSystem.init();
      window.removeEventListener("click", startAudio);
      window.removeEventListener("touchstart", startAudio);
    };
    window.addEventListener("click", startAudio);
    window.addEventListener("touchstart", startAudio);
    return () => {
      window.removeEventListener("click", startAudio);
      window.removeEventListener("touchstart", startAudio);
    };
  }, []);

  return (
    <div className="h-full w-full bg-primary relative">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: false,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true,
        }}
      >
        <Resize />
        <Suspense
          fallback={
            <Html center>
              <Loader />
            </Html>
          }
        >
          <ambientLight intensity={0.4} color="#7DD3FC" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <ParallaxBackground />
          <GlobalSnow />

          <PlayerEntity />
          <EnemyRenderer />
          <CollectibleRenderer />
          <MountainScene />

          <PhysicsSystem />
          <AISystem />
          <CollisionSystem />

          <EffectComposer disableNormalPass>
            <Bloom
              luminanceThreshold={0.2}
              mipmapBlur
              intensity={1.5}
              radius={0.4}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
