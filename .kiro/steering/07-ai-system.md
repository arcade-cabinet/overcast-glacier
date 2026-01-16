---
inclusion: fileMatch
fileMatchPattern: ['**/ai/**/*.ts', '**/lib/ai/**/*.ts']
---

# AI System (Yuka)

## Overview

Enemy AI uses Yuka library for steering behaviors and finite state machines (FSM).

## Architecture

```
src/lib/ai/
└── EnemyAI.ts  # Vehicle classes and state definitions
```

## Integration Pattern

ECS (Miniplex) manages entity lifecycle. Yuka handles AI logic. They sync each frame:

```
ECS Entity <--sync--> Yuka Vehicle
    |                      |
    v                      v
PhysicsSystem          EntityManager
(velocity integration)  (AI behaviors)
```

## Yuka Components

### EnemyVehicle

Custom vehicle class extending Yuka's Vehicle:

```typescript
class EnemyVehicle extends YUKA.Vehicle {
  enemyType: EnemyType;
  stateMachine: YUKA.StateMachine<EnemyVehicle>;
  playerRef: YUKA.GameEntity;

  constructor(type: EnemyType) {
    super();
    this.enemyType = type;
    this.stateMachine = new YUKA.StateMachine(this);

    // Configure based on type
    const config = GAME_CONFIG.enemies[type];
    this.maxSpeed = config.speed;
  }
}
```

### State Machine States

```typescript
class IdleState extends YUKA.State<EnemyVehicle> {
  enter(vehicle: EnemyVehicle) {
    vehicle.velocity.set(0, 0, 0);
  }

  execute(vehicle: EnemyVehicle) {
    // Check for player proximity
    const distToPlayer = vehicle.position.distanceTo(vehicle.playerRef.position);
    if (distToPlayer < 30) {
      vehicle.stateMachine.changeTo("CHASE");
    }
  }
}

class ChaseState extends YUKA.State<EnemyVehicle> {
  execute(vehicle: EnemyVehicle) {
    // Seek player
    const seekForce = new YUKA.Vector3()
      .subVectors(vehicle.playerRef.position, vehicle.position)
      .normalize()
      .multiplyScalar(vehicle.maxSpeed);

    vehicle.velocity.copy(seekForce);
  }
}
```

## Syncing ECS and Yuka

In AISystem (`src/ecs/systems.tsx`):

```typescript
// 1. Sync player position to Yuka proxy
playerGameEntity.position.set(
  player.position.x,
  player.position.y,
  player.position.z
);

// 2. Update Yuka simulation
entityManager.update(delta);

// 3. Copy Yuka velocity back to ECS
// (X/Z from Yuka, Y preserved for gravity)
enemy.velocity.x = vehicle.velocity.x;
enemy.velocity.z = vehicle.velocity.z;
```

## Enemy Types

| Type | Speed | Behavior | States |
|------|-------|----------|--------|
| snowman | 5 | Basic grunt | IDLE -> CHASE |
| polar_bear | 8 | Tank/Charger | IDLE -> CHASE (with charge) |
| glitch_imp | 12 | Flying pest | PATROL -> FLEE |

## Steering Behaviors

Common Yuka behaviors used:

- **Seek**: Move toward target position
- **Flee**: Move away from target
- **Wander**: Random movement with smoothing
- **Pursuit**: Predict target's future position

```typescript
// Example: Add wander behavior
const wanderBehavior = new YUKA.WanderBehavior();
wanderBehavior.jitter = 0.5;
wanderBehavior.radius = 2;
vehicle.steering.add(wanderBehavior);
```

## Best Practices

1. **Sync Y-axis separately** - Yuka handles X/Z, ECS handles gravity on Y
2. **Cleanup dead entities** - Remove Yuka vehicles when ECS entities die
3. **Use state machines** - FSM provides clear, debuggable AI behavior
4. **Configure via GAME_CONFIG** - Centralize enemy stats for easy tuning
5. **Limit update frequency** - AI doesn't need to run every frame if performance is an issue
