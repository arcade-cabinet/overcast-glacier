import * as YUKA from "yuka";
import { GAME_CONFIG } from "../../config/gameConfig";

export class EnemyVehicle extends YUKA.Vehicle {
  public enemyType: keyof typeof GAME_CONFIG.enemies;
  public playerRef: YUKA.GameEntity | null = null;

  constructor(type: keyof typeof GAME_CONFIG.enemies) {
    super();
    this.enemyType = type;
    this.maxSpeed = GAME_CONFIG.enemies[type].speed;
    this.boundingRadius = GAME_CONFIG.enemies[type].radius;
    // this.maxForce = 10;
    // this.mass = 1;
  }
}

// --- STATES ---

export class IdleState extends YUKA.State<EnemyVehicle> {
  enter(vehicle: EnemyVehicle) {
    vehicle.velocity.set(0, 0, 0);
  }

  execute(vehicle: EnemyVehicle) {
    if (vehicle.playerRef) {
      const dist = vehicle.position.distanceTo(vehicle.playerRef.position);
      if (dist < 25) {
        vehicle.stateMachine.changeTo("CHASE");
      } else if (vehicle.enemyType === "glitch_imp" && Math.random() > 0.99) {
        vehicle.stateMachine.changeTo("PATROL");
      }
    }
  }
}

export class ChaseState extends YUKA.State<EnemyVehicle> {
  enter(vehicle: EnemyVehicle) {
    if (vehicle.playerRef) {
      const seekBehavior = new YUKA.SeekBehavior(vehicle.playerRef.position);
      vehicle.steering.add(seekBehavior);

      // Context Aware: If player is far, maybe sprint? (increase maxSpeed temporarily)
    }
  }

  execute(vehicle: EnemyVehicle) {
    if (vehicle.playerRef) {
      const dist = vehicle.position.distanceTo(vehicle.playerRef.position);
      if (dist > 35) {
        vehicle.stateMachine.changeTo("IDLE");
      }
    }
  }

  exit(vehicle: EnemyVehicle) {
    vehicle.steering.clear();
    vehicle.velocity.set(0, 0, 0);
  }
}

export class PatrolState extends YUKA.State<EnemyVehicle> {
  private timer = 0;

  enter(vehicle: EnemyVehicle) {
    this.timer = 0;
    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.amount = 0.5;
    wanderBehavior.radius = 2;
    vehicle.steering.add(wanderBehavior);
  }

  execute(vehicle: EnemyVehicle) {
    this.timer++;

    if (vehicle.playerRef) {
      const dist = vehicle.position.distanceTo(vehicle.playerRef.position);
      if (dist < 25) {
        vehicle.stateMachine.changeTo("CHASE");
        return;
      }
    }

    if (this.timer > 200 || Math.random() > 0.99) {
      vehicle.stateMachine.changeTo("IDLE");
    }
  }

  exit(vehicle: EnemyVehicle) {
    vehicle.steering.clear();
    vehicle.velocity.set(0, 0, 0);
  }
}
