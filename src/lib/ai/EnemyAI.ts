import * as YUKA from "yuka";
import type * as THREE from "three";

// We'll define a custom Vehicle that holds a reference to the ECS entity ID if needed,
// but for now just standard Yuka is fine.

export class EnemyVehicle extends YUKA.Vehicle {
  public enemyType: string;
  public playerRef: YUKA.GameEntity | null = null; // Target to chase

  constructor(type: string) {
    super();
    this.enemyType = type;
    this.maxSpeed = type === "polar_bear" ? 8 : 5;
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
      } else if (
        vehicle.enemyType === "glitch_imp" &&
        Math.random() > 0.99
      ) {
        vehicle.stateMachine.changeTo("PATROL");
      }
    }
  }
}

export class ChaseState extends YUKA.State<EnemyVehicle> {
  enter(vehicle: EnemyVehicle) {
    // Add seek behavior
    if (vehicle.playerRef) {
      const seekBehavior = new YUKA.SeekBehavior(vehicle.playerRef.position);
      vehicle.steering.add(seekBehavior);
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
    
    // Check for chase
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
