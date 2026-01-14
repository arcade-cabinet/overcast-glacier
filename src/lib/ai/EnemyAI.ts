import * as YUKA from "yuka";
import { GAME_CONFIG } from "../../config/gameConfig";
import { GameRNG } from "../rng";

export class EnemyVehicle extends YUKA.Vehicle {
  public enemyType: keyof typeof GAME_CONFIG.enemies;
  public playerRef: YUKA.GameEntity | null = null;

  constructor(type: keyof typeof GAME_CONFIG.enemies) {
    super();
    this.enemyType = type;
    this.maxSpeed = GAME_CONFIG.enemies[type].speed;
    this.boundingRadius = GAME_CONFIG.enemies[type].radius;
    
    // Default Smoothing
    this.smoother = new YUKA.Smoother(5);
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
      if (dist < 30) { // Increased awareness range
        vehicle.stateMachine.changeTo("CHASE");
      } else if (
        vehicle.enemyType === "glitch_imp" &&
        GameRNG.chance(0.01)
      ) {
        vehicle.stateMachine.changeTo("PATROL");
      }
    }
  }
}

export class ChaseState extends YUKA.State<EnemyVehicle> {
  enter(vehicle: EnemyVehicle) {
    if (vehicle.playerRef) {
      // Seek Player
      const seekBehavior = new YUKA.SeekBehavior(vehicle.playerRef.position);
      vehicle.steering.add(seekBehavior);
      
      // Separation (Don't stack)
      const separationBehavior = new YUKA.SeparationBehavior();
      separationBehavior.weight = 2; // High priority to avoid clipping
      vehicle.steering.add(separationBehavior);
    }
  }

  execute(vehicle: EnemyVehicle) {
    if (vehicle.playerRef) {
      const dist = vehicle.position.distanceTo(vehicle.playerRef.position);
      if (dist > 45) { // Give up distance
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
    wanderBehavior.amount = 0.8;
    wanderBehavior.radius = 4;
    vehicle.steering.add(wanderBehavior);

    const separationBehavior = new YUKA.SeparationBehavior();
    separationBehavior.weight = 1;
    vehicle.steering.add(separationBehavior);
  }

  execute(vehicle: EnemyVehicle) {
    this.timer++;
    
    if (vehicle.playerRef) {
        const dist = vehicle.position.distanceTo(vehicle.playerRef.position);
        if (dist < 20) {
            vehicle.stateMachine.changeTo("CHASE");
            return;
        }
    }

    if (this.timer > 300 || GameRNG.chance(0.005)) {
      vehicle.stateMachine.changeTo("IDLE");
    }
  }

  exit(vehicle: EnemyVehicle) {
    vehicle.steering.clear();
    vehicle.velocity.set(0, 0, 0);
  }
}