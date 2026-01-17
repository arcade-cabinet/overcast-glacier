---
inclusion: fileMatch
fileMatchPattern: ['**/ecs/**/*.ts', '**/ecs/**/*.tsx']
---

# ECS Architecture (Miniplex)

## Overview

The game uses Miniplex for Entity Component System architecture, bridged to React via `miniplex-react`.

## Core Concepts

### World

Single world instance at `src/ecs/world.ts`:

```typescript
import { World } from "miniplex";
import { createReactAPI } from "miniplex-react";

export const world = new World<Entity>();
export const ECS = createReactAPI(world);
```

### Entity Definition

Entities are plain objects with optional components:

```typescript
type Entity = {
  id?: string;
  tag?: "player" | "enemy" | "projectile" | "collectible" | "boss";
  position: THREE.Vector3;     // Required for all game entities
  velocity?: THREE.Vector3;    // Optional physics component
  rotation?: THREE.Euler;      // Optional orientation
  health?: number;             // Optional health component
  radius?: number;             // Collision detection
  gravity?: boolean;           // Physics flag
  enemyType?: EnemyType;       // Enemy-specific
  collectibleType?: "cocoa" | "film";
};
```

### Creating Entities

```typescript
// Create player
world.add({
  tag: "player",
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, -20),
  radius: 1.0,
  gravity: true,
});

// Create enemy
world.add({
  tag: "enemy",
  position: new THREE.Vector3(5, 0, -50),
  velocity: new THREE.Vector3(0, 0, 0),
  radius: 1.0,
  enemyType: "snowman",
  gravity: true,
});
```

## Systems

Systems are React components that run logic in `useFrame`:

### Physics System

Handles gravity and velocity integration:

```typescript
export const PhysicsSystem = () => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1); // Stability cap
    const entities = world.with("position", "velocity");

    for (const entity of entities) {
      if (entity.gravity) {
        // Apply gravity
        entity.velocity.y -= 30 * dt;
      }
      // Integrate position
      entity.position.addScaledVector(entity.velocity, dt);
    }
  });
  return null;
};
```

### AI System

Bridges Miniplex entities to Yuka AI:

- Syncs ECS positions to Yuka vehicles
- Updates Yuka simulation
- Copies Yuka velocities back to ECS

### Collision System

Checks overlaps between entities:

- Player vs Enemies
- Player vs Collectibles
- Projectiles vs Enemies

## Querying Entities

### Basic Query

```typescript
// Get all entities with position
const positioned = world.with("position");

// Get all enemies
const enemies = world.with("tag").where((e) => e.tag === "enemy");
```

### Chained Queries

```typescript
// Get active enemies with position and velocity
const activeEnemies = world
  .with("tag", "position", "velocity")
  .where((e) => e.tag === "enemy");
```

### Single Entity

```typescript
// Get player entity
const player = world
  .with("tag", "position")
  .where((e) => e.tag === "player").first;

// Always null-check .first results
if (!player) return;
```

## React Integration

### ECS.Entity Component

```tsx
<ECS.Entity>
  {(entity) => (
    <mesh position={entity.position}>
      <boxGeometry />
    </mesh>
  )}
</ECS.Entity>
```

### Rendering Entity Collections

```tsx
<ECS.Entities in={world.with("tag").where((e) => e.tag === "enemy")}>
  {(entity) => <EnemyMesh entity={entity} key={entity.id} />}
</ECS.Entities>
```

## Best Practices

1. **Use `.with()` for type safety** - Narrow entity types before access
2. **Cap delta time** - `Math.min(delta, 0.1)` prevents physics explosions
3. **Clean up removed entities** - Check for stale references after removal
4. **Avoid allocations in systems** - Reuse vectors and objects
5. **Keep systems focused** - One responsibility per system
