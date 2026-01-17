import { useFrame } from "@react-three/fiber";
import * as YUKA from "yuka";
import {
  ChaseState,
  EnemyVehicle,
  IdleState,
  PatrolState,
} from "../lib/ai/EnemyAI";
import { getBiomeAt, getHeightAt } from "../lib/procedural";
import { useGameStore } from "../stores/useGameStore";
import { world } from "./world";

// --- PHYSICS SYSTEM ---
export const PhysicsSystem = () => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);

    const movingEntities = world.with("position", "velocity");

    for (const entity of movingEntities) {
      if (entity.gravity) {
        const biome = getBiomeAt(entity.position.z);
        const terrainHeight = getHeightAt(
          entity.position.x,
          entity.position.z,
          biome,
        );

        if (entity.position.y > terrainHeight) {
          entity.velocity.y -= 30 * dt;
        } else if (entity.velocity.y < 0) {
          entity.velocity.y = 0;
          entity.position.y = terrainHeight;
        }
      }

      // Explicitly integrate position for non-Yuka entities or Y override
      // Note: Yuka handles X/Z steering, but we might want manual gravity on Y.
      entity.position.addScaledVector(entity.velocity, dt);

      if (entity.tag === "projectile" && entity.position.y < -50) {
        world.remove(entity);
      }
    }
  });
  return null;
};

// --- AI SYSTEM (YUKA) ---
export const AISystem = () => {
  // Yuka Manager
  const entityManager = new YUKA.EntityManager();
  // Map ECS Entity -> Yuka Vehicle
  const entityMap = new Map<number, EnemyVehicle>();
  // Player proxy in Yuka world (so enemies can seek it)
  const playerGameEntity = new YUKA.GameEntity();
  entityManager.add(playerGameEntity);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Sync Player Position to Yuka
    const player = world
      .with("tag", "position")
      .where((e) => e.tag === "player").first;
    if (player) {
      playerGameEntity.position.set(
        player.position.x,
        player.position.y,
        player.position.z,
      );
    }

    // Sync Enemies
    const enemies = world.with("tag", "enemyType", "position", "velocity");
    const activeEntities = new Set<number>();

    for (const enemy of enemies) {
      activeEntities.add(enemy);

      let vehicle = entityMap.get(enemy);
      if (!vehicle) {
        // Create new Vehicle with typed enemyType
        // @ts-expect-error - enemyType is string in ECS, but typed in Vehicle. Cast or validate.
        vehicle = new EnemyVehicle(enemy.enemyType);
        vehicle.position.set(
          enemy.position.x,
          enemy.position.y,
          enemy.position.z,
        );
        vehicle.playerRef = playerGameEntity;

        // Setup States
        const idleState = new IdleState();
        const chaseState = new ChaseState();
        const patrolState = new PatrolState();

        vehicle.stateMachine.add("IDLE", idleState);
        vehicle.stateMachine.add("CHASE", chaseState);
        vehicle.stateMachine.add("PATROL", patrolState);

        vehicle.stateMachine.changeTo("IDLE");

        entityManager.add(vehicle);
        entityMap.set(enemy, vehicle);
      }

      // 1. Sync Physics -> Yuka (If external physics affected position, e.g. collisions/teleport)
      // Actually, Yuka drives velocity for X/Z. We let PhysicsSystem handle Y (gravity).
      // So we sync Y from ECS to Yuka so Yuka knows 3D distance?
      vehicle.position.y = enemy.position.y;
    }

    // Update Yuka
    entityManager.update(dt);

    // Sync Yuka -> ECS
    for (const enemy of enemies) {
      const vehicle = entityMap.get(enemy);
      if (vehicle) {
        // Copy calculated velocity from Yuka to ECS
        // We preserve ECS Y velocity (gravity)
        enemy.velocity.x = vehicle.velocity.x;
        enemy.velocity.z = vehicle.velocity.z;

        // Or if Yuka manages position integration completely (for X/Z):
        // enemy.position.x = vehicle.position.x;
        // enemy.position.z = vehicle.position.z;
        // But PhysicsSystem does "position.addScaledVector(velocity)", so passing velocity is better integration.
      }
    }

    // Cleanup dead entities
    for (const [entity, vehicle] of entityMap) {
      if (!activeEntities.has(entity)) {
        entityManager.remove(vehicle);
        entityMap.delete(entity);
      }
    }
  });

  return null;
};

// --- COLLISION SYSTEM ---
export const CollisionSystem = () => {
  const decreaseWarmth = useGameStore((state) => state.decreaseWarmth);
  const increaseWarmth = useGameStore((state) => state.increaseWarmth);
  const addScore = useGameStore((state) => state.addScore);
  const setPlayerForm = useGameStore((state) => state.setPlayerForm);
  const playerForm = useGameStore((state) => state.playerForm);

  useFrame(() => {
    const player = world
      .with("tag", "position", "radius")
      .where((e) => e.tag === "player").first;
    if (!player) return;

    // Player vs Enemies
    const enemies = world
      .with("tag", "position", "radius")
      .where((e) => e.tag === "enemy");
    for (const enemy of enemies) {
      if (
        player.position.distanceTo(enemy.position) <
        (player.radius ?? 0) + (enemy.radius ?? 0)
      ) {
        // Collision!
        if (playerForm === "snowman") {
          // Crush enemy
          world.remove(enemy);
          addScore(200);
        } else {
          // Hit player
          decreaseWarmth(15);
          world.remove(enemy); // Enemy dies on impact
          if (enemy.enemyType === "snowman" && Math.random() > 0.5) {
            setPlayerForm("snowman");
          }
        }
      }
    }

    // Player vs Collectibles
    const collectibles = world
      .with("tag", "position", "radius")
      .where((e) => e.tag === "collectible");
    for (const item of collectibles) {
      if (
        player.position.distanceTo(item.position) <
        (player.radius ?? 0) + (item.radius ?? 0)
      ) {
        if (item.collectibleType === "cocoa") {
          increaseWarmth(30);
          if (playerForm === "snowman") {
            setPlayerForm("kitten");
            addScore(500);
          }
        }
        world.remove(item);
        addScore(50);
      }
    }

    // Projectiles vs Enemies
    const projectiles = world
      .with("tag", "position", "radius")
      .where((e) => e.tag === "projectile");

    // Re-query enemies to ensure we have up-to-date list (in case some were removed above)
    const activeEnemies = world
      .with("tag", "position", "radius")
      .where((e) => e.tag === "enemy");

    for (const p of projectiles) {
      for (const e of activeEnemies) {
        if (
          p.position.distanceTo(e.position) <
          (p.radius ?? 0) + (e.radius ?? 0)
        ) {
          world.remove(e);
          world.remove(p);
          addScore(100);
          break;
        }
      }
    }
  });
  return null;
};
