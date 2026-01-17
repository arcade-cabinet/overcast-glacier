---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']
---

# TypeScript Guidelines

## Type Safety

### Strict Mode

The project uses TypeScript strict mode. Follow these rules:

- No implicit `any` types
- Explicit return types on functions
- Null checks required before accessing optional properties
- Use `type` assertions sparingly and with `as`

### Entity Types

ECS entities use the `Entity` type from `src/ecs/world.ts`:

```typescript
export type Entity = {
  id?: string;
  tag?: "player" | "enemy" | "projectile" | "collectible" | "boss";
  position: THREE.Vector3;
  velocity?: THREE.Vector3;
  rotation?: THREE.Euler;
  health?: number;
  playerForm?: PlayerForm;
  enemyType?: EnemyType;
  collectibleType?: "cocoa" | "film";
  radius?: number;
  gravity?: boolean;
  active?: boolean;
};
```

### Game State Types

Game state is defined in `src/stores/useGameStore.ts`:

```typescript
type GameState = "initial" | "menu" | "playing" | "gameover" | "paused" | "boss_intro" | "victory";
type PlayerForm = "kitten" | "snowman";
```

## Patterns

### ECS System Pattern

Systems are React components that use `useFrame`:

```typescript
export const MySystem = () => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1); // Cap delta for stability
    const entities = world.with("position", "velocity");

    for (const entity of entities) {
      // Update logic
    }
  });
  return null;
};
```

### Zustand Store Pattern

```typescript
interface MyStore {
  value: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
}));
```

### Three.js Vector Pattern

Always mutate existing vectors instead of creating new ones in hot paths:

```typescript
// Good - mutate existing
entity.position.addScaledVector(entity.velocity, delta);

// Bad - creates garbage
entity.position = entity.position.add(entity.velocity.multiplyScalar(delta));
```

## Common Pitfalls

### 1. Missing Null Checks

```typescript
// Bad
const player = world.where((e) => e.tag === "player").first;
player.position.x = 0; // Might be undefined!

// Good
const player = world.with("tag", "position").where((e) => e.tag === "player").first;
if (!player) return;
player.position.x = 0;
```

### 2. Creating Objects in useFrame

Avoid allocations inside the render loop:

```typescript
// Bad - creates new Vector3 every frame
useFrame(() => {
  const offset = new THREE.Vector3(0, 5, 10);
  // ...
});

// Good - reuse or compute inline
const CAMERA_OFFSET = new THREE.Vector3(0, 5, 10);
useFrame(() => {
  // Use CAMERA_OFFSET
});
```

### 3. Type Narrowing with ECS

Use `.with()` to narrow entity types:

```typescript
// Get only entities with position AND velocity
const movingEntities = world.with("position", "velocity");

// Now TypeScript knows these properties exist
for (const entity of movingEntities) {
  entity.velocity.x; // OK - guaranteed to exist
}
```
