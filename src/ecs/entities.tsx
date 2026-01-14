import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { HotCocoa } from "../components/Collectibles";
import { GlitchImp, PolarBear, Snowman } from "../components/Enemies";
import { getBiomeAt, getHeightAt } from "../lib/procedural";
import { clamp, lerp } from "../lib/utils"; // Re-import utils
import { useGameStore } from "../stores/useGameStore";
import type { EnemyInstance } from "../types";
import { ECS } from "./world";

// --- PLAYER ---
export const PlayerEntity = () => {
  const playerForm = useGameStore((state) => state.playerForm);

  // Initial Spawn
  return (
    <ECS.Entity>
      <ECS.Component name="tag" data="player" />
      <ECS.Component name="position" data={new THREE.Vector3(0, 5, 0)} />
      <ECS.Component name="velocity" data={new THREE.Vector3(0, 0, -10)} />
      <ECS.Component name="radius" data={1.0} />
      <ECS.Component name="gravity" data={true} />
      <ECS.Component name="playerForm" data={playerForm} />

      <PlayerRender />
    </ECS.Entity>
  );
};

const PlayerRender = () => {
  const entity = ECS.useCurrentEntity();
  const mesh = useRef<THREE.Group>(null);
  const form = useGameStore((state) => state.playerForm); // Sync render with store directly for reactivity

  // Input Handling (Moved from old Player.tsx)
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      if (x > window.innerWidth / 2) keys.current["ArrowRight"] = true;
      else keys.current["ArrowLeft"] = true;
      if (e.touches.length > 1) keys.current["Space"] = true;
    };
    const onTouchEnd = () => {
      keys.current["ArrowRight"] = false;
      keys.current["ArrowLeft"] = false;
      keys.current["Space"] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // --- INPUT LOGIC APPLIED TO ENTITY VELOCITY ---
    const speed = form === "snowman" ? 10 : 20;
    let targetX = entity.position.x;

    if (keys.current["ArrowLeft"] || keys.current["KeyA"])
      targetX -= speed * dt;
    if (keys.current["ArrowRight"] || keys.current["KeyD"])
      targetX += speed * dt;

    // Lateral smoothing
    entity.position.x = lerp(entity.position.x, targetX, dt * 5);
    entity.position.x = clamp(entity.position.x, -18, 18);

    // Jump
    if (
      form === "kitten" &&
      (keys.current["Space"] || keys.current["ArrowUp"])
    ) {
      // Ground check using procedural height
      const biome = getBiomeAt(entity.position.z);
      const groundHeight = getHeightAt(
        entity.position.x,
        entity.position.z,
        biome,
      );

      if (entity.position.y <= groundHeight + 0.5) {
        entity.velocity.y = 12;
      }
    }

    if (mesh.current) {
      mesh.current.position.copy(entity.position);

      // Camera Follow
      const targetPos = new THREE.Vector3(
        entity.position.x * 0.5,
        entity.position.y + 5,
        entity.position.z + 10,
      );
      state.camera.position.lerp(targetPos, dt * 5);
      state.camera.lookAt(
        entity.position.x,
        entity.position.y,
        entity.position.z - 5,
      );

      // Rotation
      mesh.current.rotation.y = lerp(
        mesh.current.rotation.y,
        (targetX - entity.position.x) * -0.1,
        dt * 5,
      );
    }
  });

  return (
    <group ref={mesh}>
      {form === "kitten" ? (
        <group>
          <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.4, 1, -0.2]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh castShadow position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial color="#E0F2FE" />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial color="#E0F2FE" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ... EnemyRenderer and CollectibleRenderer remain same ...
export const EnemyRenderer = ({
  onRegister,
}: {
  onRegister?: (instance: EnemyInstance) => () => void;
}) => {
  const register = onRegister || (() => () => {});
  return (
    <ECS.Entities in={ECS.world.with("tag", "enemyType")}>
      {(entity) => (
        <group position={entity.position}>
          {entity.enemyType === "snowman" && (
            <Snowman position={[0, 0, 0]} onRegister={register} />
          )}
          {entity.enemyType === "polar_bear" && (
            <PolarBear position={[0, 0, 0]} onRegister={register} />
          )}
          {entity.enemyType === "glitch_imp" && (
            <GlitchImp position={[0, 0, 0]} onRegister={register} />
          )}
        </group>
      )}
    </ECS.Entities>
  );
};

export const CollectibleRenderer = () => {
  return (
    <ECS.Entities in={ECS.world.with("tag", "collectibleType")}>
      {(entity) => (
        <group position={entity.position}>
          {entity.collectibleType === "cocoa" && (
            <HotCocoa position={[0, 0, 0]} onRegister={() => () => {}} />
          )}
        </group>
      )}
    </ECS.Entities>
  );
};
