import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import {
  CollectibleRenderer,
  EnemyRenderer,
  PlayerEntity,
} from "../ecs/entities";
// import { ECS } from '../ecs/world';
import { CollisionSystem, PhysicsSystem, AISystem } from "../ecs/systems";
import { MountainScene } from "../scenes/MountainScene";
import { GlobalSnow } from "./GlobalSnow";
import { ParallaxBackground } from "./ParallaxBackground";
import { Resize } from "./Resize";

export const GameCanvas = () => {
  return (
    <div className="h-full w-full bg-primary relative">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }} shadows dpr={[1, 2]}>
        <Resize />
        <Suspense fallback={null}>
          {/* ECS Provider removed as it might not exist in Miniplex 2? */}
          <ambientLight intensity={0.5} color="#7DD3FC" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1}
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
        </Suspense>
      </Canvas>
    </div>
  );
};
