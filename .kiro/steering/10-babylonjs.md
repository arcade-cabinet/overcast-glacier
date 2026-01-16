---
inclusion: fileMatch
fileMatchPattern: ['**/scenes/**/*.tsx', '**/native/**/*.tsx']
---

# Babylon.js React Native Guidelines

## Overview

The game uses Babylon.js React Native for true native 3D rendering on iOS/Android.

## Core Components

### EngineView Setup

```tsx
import { View, StyleSheet } from "react-native";
import { EngineView, useEngine } from "@babylonjs/react-native";

function GameScene() {
  const engine = useEngine();

  useEffect(() => {
    if (!engine) return;
    // Initialize scene when engine is available
  }, [engine]);

  return (
    <View style={styles.container}>
      <EngineView style={styles.engine} />
    </View>
  );
}
```

### Scene Initialization

Create scene, camera, and lights in useEffect when engine is available:

```tsx
import {
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Color4,
} from "@babylonjs/core";

useEffect(() => {
  if (!engine) return;

  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.06, 0.09, 0.16, 1);

  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3,
    30,
    Vector3.Zero(),
    scene
  );

  const light = new HemisphericLight(
    "light",
    new Vector3(0, 1, -0.5),
    scene
  );
  light.intensity = 0.8;

  // Start render loop
  engine.runRenderLoop(() => {
    scene.render();
  });

  return () => {
    scene.dispose();
  };
}, [engine]);
```

### Game Loop

Use `onBeforeRenderObservable` for game logic:

```tsx
scene.onBeforeRenderObservable.add(() => {
  // Access Zustand state directly (not via hook)
  const gameState = useGameStore.getState().gameState;

  if (gameState === "playing") {
    // Update player position
    player.position.z += velocity * deltaTime;

    // Update camera
    camera.target.z = player.position.z;
  }
});
```

## Mesh Creation

### Basic Primitives

```tsx
import { MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

// Create sphere
const player = MeshBuilder.CreateSphere("player", { diameter: 1 }, scene);
player.position.y = 2;

// Apply material
const material = new StandardMaterial("playerMat", scene);
material.diffuseColor = new Color3(1, 0.8, 0.6);
player.material = material;
```

### Ground/Terrain

```tsx
const ground = MeshBuilder.CreateGround(
  "ground",
  {
    width: 100,
    height: 100,
    subdivisions: 32,
    updatable: true,
  },
  scene
);

// Modify vertices for terrain
const positions = ground.getVerticesData("position");
if (positions) {
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    positions[i + 1] = getTerrainHeight(x, z);
  }
  ground.updateVerticesData("position", positions);
  ground.refreshBoundingInfo();
}
```

## Performance Rules

### 1. Avoid Allocations in Render Loop

```typescript
// Bad - creates new Vector3 every frame
scene.onBeforeRenderObservable.add(() => {
  mesh.position = new Vector3(x, y, z);
});

// Good - mutate existing position
scene.onBeforeRenderObservable.add(() => {
  mesh.position.set(x, y, z);
});
```

### 2. Dispose Resources

Always dispose meshes, materials, and scenes:

```typescript
// Remove mesh
mesh.dispose();

// Cleanup on unmount
return () => {
  scene.dispose();
};
```

### 3. Use Object Pooling

Reuse meshes instead of creating/destroying:

```typescript
const enemyPool: Mesh[] = [];

function getEnemy() {
  return enemyPool.pop() || createNewEnemy();
}

function returnEnemy(enemy: Mesh) {
  enemy.setEnabled(false);
  enemyPool.push(enemy);
}
```

## Zustand Integration

Access Zustand state from Babylon.js code:

```typescript
import { useGameStore } from "../stores/useGameStore";

// In render loop - use getState() for non-reactive reads
scene.onBeforeRenderObservable.add(() => {
  const { gameState, addScore, decreaseWarmth } = useGameStore.getState();

  if (gameState === "playing") {
    addScore(1);
    decreaseWarmth(0.01);
  }
});
```

## Biome Colors

Project uses these biome colors for terrain:

```typescript
const BIOME_COLORS = {
  open_slope: new Color3(0.97, 0.98, 1.0),   // Snow white
  ice_cave: new Color3(0.49, 0.83, 0.99),    // Ice blue
  frozen_rink: new Color3(0.72, 0.89, 0.99), // Light ice
  cocoa_valley: new Color3(0.55, 0.27, 0.07),// Cocoa brown
  summit: new Color3(0.87, 0.87, 0.87),      // Gray rock
};
```

## Common Issues

### 1. Engine Not Available

Always check for engine before scene operations:

```typescript
if (!engine) return;
```

### 2. Scene Not Disposed

Memory leaks if scene not properly cleaned up:

```typescript
return () => {
  engine.stopRenderLoop();
  scene.dispose();
};
```

### 3. React State in Babylon Loop

Don't use React hooks in Babylon loops - use `getState()`:

```typescript
// Bad - hooks don't work in non-React context
scene.onBeforeRenderObservable.add(() => {
  const score = useGameStore((s) => s.score); // Won't work
});

// Good - use getState() for direct access
scene.onBeforeRenderObservable.add(() => {
  const score = useGameStore.getState().score;
});
```

## Key Differences from Three.js/R3F

| Three.js/R3F | Babylon.js React Native |
|--------------|------------------------|
| `<Canvas>` | `<EngineView>` |
| `useFrame` hook | `onBeforeRenderObservable` |
| drei helpers | Built-in Babylon utilities |
| Declarative JSX | Imperative scene building |
| `@react-three/fiber` | `@babylonjs/react-native` |
