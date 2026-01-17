import { createNoise2D } from "simplex-noise";
import { GAME_CONFIG } from "../config/gameConfig";
import { TerrainRNG } from "./rng";

// Use seeded RNG for deterministic noise
const noise2D = createNoise2D(() => TerrainRNG.next());

export const CHUNK_SIZE = 100;

export type BiomeType =
  | "open_slope"
  | "ice_cave"
  | "frozen_rink"
  | "cocoa_valley"
  | "summit";

export const getBiomeAt = (z: number): BiomeType => {
  const absZ = Math.abs(z);

  if (absZ > GAME_CONFIG.boss.spawnZ - 50) return "summit";

  // Use noise to determine biome transitions
  const n = noise2D(z * 0.001, 0);

  if (n > GAME_CONFIG.biomes.ice_cave.noiseThreshold) return "ice_cave";
  if (n > GAME_CONFIG.biomes.frozen_rink.noiseThreshold) return "frozen_rink";
  if (n < GAME_CONFIG.biomes.cocoa_valley.noiseThreshold) return "cocoa_valley";

  return "open_slope";
};

export const getHeightAt = (x: number, z: number, biome: BiomeType): number => {
  const slope = -0.1; // Base downward slope
  const baseHeight = z * slope;

  switch (biome) {
    case "ice_cave": {
      const n = noise2D(x * 0.1, z * 0.05);
      // Narrower path with walls
      const wallHeight = Math.max(0, (Math.abs(x) - 10) * 5);
      return baseHeight + n * 2 + wallHeight;
    }
    case "frozen_rink": {
      // Very flat
      return baseHeight + noise2D(x * 0.01, z * 0.01) * 0.2;
    }
    case "cocoa_valley": {
      // Gentle hills
      return baseHeight + noise2D(x * 0.05, z * 0.05) * 3;
    }
    case "summit": {
      // High plateau
      return baseHeight + 5;
    }
    default: {
      // open_slope
      const n = noise2D(x * 0.05, z * 0.02);
      return baseHeight + n * 5;
    }
  }
};

export const getBiomeColor = (biome: BiomeType): string => {
  return GAME_CONFIG.biomes[biome].color;
};
