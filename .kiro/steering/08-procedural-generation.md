---
inclusion: fileMatch
fileMatchPattern: ['**/procedural.ts', '**/lib/procedural.ts']
---

# Procedural Generation

## Overview

Terrain and game content is generated procedurally based on player position using deterministic algorithms.

## Core Concepts

### Biomes

The game world is divided into biomes defined in `GAME_CONFIG`:

```typescript
type BiomeType = "open_slope" | "ice_cave" | "frozen_rink" | "cocoa_valley" | "summit";

const biomes = {
  open_slope: { color: "#F0F9FF", enemyDensity: 2, prob: 0.4 },
  ice_cave: { color: "#7DD3FC", enemyDensity: 4, prob: 0.6 },
  frozen_rink: { color: "#E0F2FE", enemyDensity: 3, prob: 0.3 },
  cocoa_valley: { color: "#BAE6FD", enemyDensity: 2, prob: -0.5 },
  summit: { color: "#F8FAFC", enemyDensity: 0, prob: 2.0 },
};
```

### Biome Selection

Biomes are selected based on noise value at Z position:

```typescript
import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D(() => 0.5); // Seeded for determinism

export function getBiomeAt(z: number): BiomeType {
  const noiseValue = noise2D(0, z * 0.001);
  // Map noise to biome based on probability thresholds
  // ...
}
```

### Height Map

Terrain height varies by X position and biome:

```typescript
export function getHeightAt(x: number, z: number, biome: BiomeType): number {
  const baseHeight = noise2D(x * 0.1, z * 0.1) * 2;

  switch (biome) {
    case "ice_cave":
      return baseHeight - 2; // Lower terrain
    case "summit":
      return baseHeight + 5; // Elevated
    default:
      return baseHeight;
  }
}
```

## Chunk System

Terrain is generated in chunks that move relative to player:

```typescript
const CHUNK_SIZE = 50; // Z-axis length
const VISIBLE_CHUNKS = 5; // Ahead of player

function getVisibleChunks(playerZ: number): number[] {
  const currentChunk = Math.floor(playerZ / CHUNK_SIZE);
  return Array.from(
    { length: VISIBLE_CHUNKS },
    (_, i) => currentChunk - i - 1
  );
}
```

## Enemy Spawning

Enemies spawn based on biome density and player distance:

```typescript
function spawnEnemiesForChunk(chunkIndex: number) {
  const z = chunkIndex * CHUNK_SIZE;
  const biome = getBiomeAt(z);
  const density = GAME_CONFIG.biomes[biome].enemyDensity;

  for (let i = 0; i < density; i++) {
    const spawnX = GameRNG.range(-10, 10);
    const spawnZ = z + GameRNG.range(0, CHUNK_SIZE);

    world.add({
      tag: "enemy",
      position: new THREE.Vector3(spawnX, 0, spawnZ),
      velocity: new THREE.Vector3(0, 0, 0),
      enemyType: selectEnemyType(biome),
      radius: 1.0,
      gravity: true,
    });
  }
}
```

## Deterministic RNG

All procedural generation uses the seeded RNG from `src/lib/rng.ts`:

```typescript
import { GameRNG, RNG } from "@/lib/rng";

// Global instance for game logic
GameRNG.range(0, 10);

// Create isolated streams for specific systems
const TerrainRNG = new RNG(12345);
const SpawnRNG = new RNG(67890);
```

## Best Practices

1. **Seed everything** - Use seeded RNG, never `Math.random()` for game logic
2. **Chunk-based generation** - Generate only what's visible
3. **Cache results** - Store computed terrain/biome data
4. **Despawn behind player** - Remove entities player has passed
5. **Deterministic replay** - Same seed = same game, useful for testing
6. **Use noise for natural variation** - Simplex noise for smooth transitions
