---
inclusion: fileMatch
fileMatchPattern: ['**/*.tsx', '**/components/**/*.tsx', '**/scenes/**/*.tsx']
---

# React Three Fiber Guidelines

## Overview

The game uses React Three Fiber (R3F) for 3D rendering, with drei helpers.

## Core Patterns

### Canvas Setup

```tsx
import { Canvas } from "@react-three/fiber";

function GameCanvas() {
  return (
    <Canvas
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [0, 5, 10], fov: 75 }}
    >
      <Scene />
    </Canvas>
  );
}
```

### Using useFrame

The render loop hook - runs every frame:

```tsx
import { useFrame } from "@react-three/fiber";

function MovingObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

### Performance Rules for useFrame

1. **Cap delta**: `const dt = Math.min(delta, 0.1)`
2. **Avoid allocations**: No `new Vector3()` inside
3. **Null check refs**: Always verify ref exists
4. **Early return**: Exit fast if nothing to do

## drei Helpers

Common drei components used:

```tsx
import {
  OrbitControls,    // Debug camera controls
  Environment,      // HDR lighting
  Text,            // 3D text
  useTexture,      // Texture loading
  Float,           // Floating animation
} from "@react-three/drei";
```

## ECS + R3F Integration

Render ECS entities as R3F components:

```tsx
import { ECS, world } from "@/ecs/world";

function Enemies() {
  return (
    <ECS.Entities in={world.with("tag", "position").where((e) => e.tag === "enemy")}>
      {(entity) => (
        <mesh key={entity.id} position={entity.position}>
          <sphereGeometry args={[entity.radius ?? 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      )}
    </ECS.Entities>
  );
}
```

## Zustand + R3F

Subscribe to Zustand state in R3F components:

```tsx
import { useGameStore } from "@/stores/useGameStore";

function HUD() {
  const score = useGameStore((s) => s.score);
  const warmth = useGameStore((s) => s.warmth);

  // Render 3D HUD elements
}
```

## Common Pitfalls

### 1. State Updates in useFrame

Don't call `setState` every frame - use refs:

```tsx
// Bad - causes re-renders
useFrame(() => {
  setPosition(new Vector3(x, y, z));
});

// Good - mutate ref
useFrame(() => {
  meshRef.current.position.set(x, y, z);
});
```

### 2. Missing Keys

Always provide stable keys for dynamic elements:

```tsx
// Bad - array index changes on add/remove
{entities.map((e, i) => <Mesh key={i} />)}

// Good - stable entity ID
{entities.map((e) => <Mesh key={e.id} />)}
```

### 3. Blocking the Main Thread

Heavy computation blocks rendering:

```tsx
// Bad - blocks render
useFrame(() => {
  for (let i = 0; i < 100000; i++) { /* ... */ }
});

// Good - spread work or use worker
```

## Post-Processing

The project uses `@react-three/postprocessing`:

```tsx
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";

function Effects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.9} intensity={0.5} />
      <Noise opacity={0.02} />
    </EffectComposer>
  );
}
```

Keep effects minimal for mobile performance.
