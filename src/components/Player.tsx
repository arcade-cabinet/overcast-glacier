import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Motion } from "@capacitor/motion";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getHeightAt } from "../lib/procedural";
import { clamp, lerp } from "../lib/utils";
import { useGameStore } from "../stores/useGameStore";
import type { CollectibleInstance, EnemyInstance } from "../types";
import { Snowball } from "./Projectiles";

interface PlayerProps {
  enemiesRef?: React.MutableRefObject<EnemyInstance[]>;
  collectiblesRef?: React.MutableRefObject<CollectibleInstance[]>;
}

export const Player = ({ enemiesRef, collectiblesRef }: PlayerProps) => {
  const mesh = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [snowballs, setSnowballs] = useState<
    { id: string; pos: THREE.Vector3; vel: THREE.Vector3 }[]
  >([]);

  // Store Actions
  const decreaseWarmth = useGameStore((state) => state.decreaseWarmth);
  const increaseWarmth = useGameStore((state) => state.increaseWarmth);
  const addScore = useGameStore((state) => state.addScore);
  const playerForm = useGameStore((state) => state.playerForm);
  const setPlayerForm = useGameStore((state) => state.setPlayerForm);
  const addPhoto = useGameStore((state) => state.addPhoto);
  const tickDeveloping = useGameStore((state) => state.tickDeveloping);

  // Physics state
  const velocity = useRef(new THREE.Vector3(0, 0, -10)); // Moving forward
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const isJumping = useRef(false);
  const lastPhotoTime = useRef(0);
  
  // Motion State
  const tilt = useRef(0); // -1 to 1 based on gamma

  // Helper for spawning snowballs
  const spawnSnowball = () => {
    if (useGameStore.getState().playerForm === "kitten") {
      Haptics.impact({ style: ImpactStyle.Light });
      const spawnPos = position.current
        .clone()
        .add(new THREE.Vector3(0, 1, -1));
      const spawnVel = new THREE.Vector3(0, 2, -20);
      spawnVel.z += velocity.current.z;
      setSnowballs((prev) => [
        ...prev,
        { id: Math.random().toString(), pos: spawnPos, vel: spawnVel },
      ]);
    }
  };

  const jump = () => {
    const terrainHeight = getHeightAt(
      position.current.x,
      position.current.z,
      "open_slope",
    );
    if (
      playerForm === "kitten" &&
      !isJumping.current &&
      position.current.y <= terrainHeight + 0.5
    ) {
      Haptics.impact({ style: ImpactStyle.Medium });
      velocity.current.y = 12;
      isJumping.current = true;
    }
  };

  useEffect(() => {
    // Motion Listeners
    let accelHandler: any;
    
    const setupMotion = async () => {
        try {
            accelHandler = await Motion.addListener('accel', event => {
                // Use X acceleration for tilt (steering)
                // x is roughly -10 to 10 when tilted 90 degrees
                // We want to map roughly -3 to 3 to full steer
                if (event.accelerationIncludingGravity) {
                    const x = event.accelerationIncludingGravity.x || 0;
                    tilt.current = clamp(-x / 3, -1, 1);
                }
            });
        } catch (e) {
            console.error("Motion not supported", e);
        }
    };
    setupMotion();

    // Touch Listeners
    const onTouchStart = (e: TouchEvent) => {
      // Simple logic:
      // Tap Left side: Jump
      // Tap Right side: Fire
      // (Steering is handled by tilt)
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX > window.innerWidth / 2) {
            spawnSnowball();
        } else {
            jump();
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart);

    return () => {
      if (accelHandler) accelHandler.remove();
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [playerForm]); // Re-bind if needed, but refs cover most state

  useFrame((state, delta) => {
    if (!mesh.current) return;

    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    // Developing Photos Tick
    tickDeveloping(dt * 10);

    // --- MOVEMENT ---
    const baseSpeed = playerForm === "snowman" ? 10 : 20;
    
    // Apply tilt to horizontal velocity
    // Smooth out the tilt value
    let targetX = position.current.x + (tilt.current * baseSpeed * dt * 2);

    // Smooth lateral movement
    position.current.x = lerp(position.current.x, targetX, dt * 5);
    position.current.x = clamp(position.current.x, -18, 18);

    // Forward movement
    position.current.z += velocity.current.z * dt;

    // Terrain Following
    const terrainHeight = getHeightAt(
      position.current.x,
      position.current.z,
      "open_slope",
    );

    // Gravity
    if (position.current.y > terrainHeight) {
      velocity.current.y -= 30 * dt;
    } else {
      velocity.current.y = 0;
      position.current.y = terrainHeight;
      isJumping.current = false;
    }

    position.current.y += velocity.current.y * dt;

    // Update mesh position
    mesh.current.position.copy(position.current);

    // --- CAMERA FOLLOW ---
    const cameraTargetPos = new THREE.Vector3(
      position.current.x * 0.5,
      position.current.y + 5,
      position.current.z + 10,
    );
    camera.position.lerp(cameraTargetPos, dt * 5);
    camera.lookAt(
      position.current.x,
      position.current.y,
      position.current.z - 5,
    );

    // --- AUTOMATIC PHOTO ---
    // Instead of C key, maybe double tap or just auto-snap special moments?
    // For now, let's make it automatic when near a boss or special enemy
    // Or add a dedicated on-screen button in HUD (which calls store action)
    // Here we check for manual trigger via store if we add one, or keep logic simpler.
    
    // --- COMBAT / COLLISION ---
    if (enemiesRef?.current) {
      enemiesRef.current.forEach((enemy) => {
        const dist = position.current.distanceTo(enemy.position);
        if (dist < 1.5) {
          if (playerForm === "snowman") {
            Haptics.impact({ style: ImpactStyle.Heavy });
            enemy.hit();
            addScore(200);
          } else if (isJumping.current) {
            Haptics.impact({ style: ImpactStyle.Medium });
            enemy.hit();
            addScore(100);
          } else {
            Haptics.vibrate({ duration: 200 });
            decreaseWarmth(15);
            enemy.hit();
            if (enemy.type === "snowman" && Math.random() > 0.5) {
              setPlayerForm("snowman");
            }
          }
        }
      });
    }

    // --- COLLECTIBLES ---
    if (collectiblesRef?.current) {
      collectiblesRef.current.forEach((item) => {
        const dist = position.current.distanceTo(item.position);
        if (dist < 2.0) {
          if (item.type === "cocoa") {
            Haptics.notification({ type: "success" });
            increaseWarmth(30);
            if (playerForm === "snowman") {
              setPlayerForm("kitten");
              addScore(500); 
            }
          }
          item.collect();
          addScore(50);
        }
      });
    }

    // Rotation
    mesh.current.rotation.y = lerp(
      mesh.current.rotation.y,
      tilt.current * -0.5, // Tilt mesh based on accelerometer
      dt * 5,
    );
    if (playerForm === "snowman") {
      mesh.current.rotation.x += velocity.current.z * dt * 0.5;
    } else {
      mesh.current.rotation.x = 0;
    }

    // Warmth Drain
    if (state.clock.elapsedTime % 1 < dt) {
      decreaseWarmth(1);
    }
    addScore(Math.abs(velocity.current.z * dt));
  });

  return (
    <group ref={mesh}>
      {/* SNOWBALLS */}
      {enemiesRef &&
        snowballs.map((s) => (
          <Snowball
            key={s.id}
            position={s.pos}
            velocity={s.vel}
            enemiesRef={enemiesRef as React.MutableRefObject<EnemyInstance[]>}
            onHit={() => {
              setSnowballs((prev) => prev.filter((p) => p.id !== s.id));
            }}
          />
        ))}

      {playerForm === "kitten" ? (
        <group>
          {/* KITTEN MESH */}
          <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.4, 1, -0.2]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="black" />
          </mesh>
          {/* Ears */}
          <mesh position={[0.3, 1, 0]}>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[-0.3, 1, 0]}>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      ) : (
        <group>
          {/* SNOWMAN MESH */}
          <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#EFF6FF" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#EFF6FF" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};