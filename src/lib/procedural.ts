import { createNoise2D } from 'simplex-noise';

export type BiomeType = 'open_slope' | 'ice_cave' | 'frozen_rink' | 'cocoa_valley' | 'snowball_arena' | 'summit';

const noise2D = createNoise2D();

export const CHUNK_SIZE = 200; // meters

export const getBiomeAt = (z: number): BiomeType => {
  // z is negative as we go down the mountain
  // Scale z to make biomes last roughly 500-1500m (2-7 chunks)
  // z * 0.002 implies a period of ~1000ish
  const val = noise2D(0, z * 0.002);

  if (z < -15000) return 'summit';

  // Adjusted thresholds based on requested frequencies
  if (val > 0.6) return 'ice_cave';       // ~20%
  if (val > 0.4) return 'frozen_rink';    // ~10%
  if (val < -0.7) return 'cocoa_valley';  // ~15%
  if (val < -0.5) return 'snowball_arena';// ~10%

  return 'open_slope'; // Remainder ~45%
};

export const getHeightAt = (x: number, z: number, biome: BiomeType): number => {
  const baseNoise = noise2D(x * 0.05, z * 0.02) * 2;
  const slope = - (z * 0.2); // Base downhill slope

  switch (biome) {
    case 'open_slope':
        // Standard uneven terrain
        return slope + baseNoise;

    case 'ice_cave':
        // U-pipe shape: flat center, steep walls
        // x goes from -20 to 20 roughly
        const caveWall = Math.pow(Math.abs(x) / 10, 4);
        return slope + baseNoise * 0.5 + caveWall;

    case 'frozen_rink':
        // Perfectly flat surface
        return slope;

    case 'cocoa_valley':
        // Bowl shape, cozy
        const bowl = Math.pow(x / 15, 2) * 2;
        return slope + bowl + baseNoise * 0.2;

    case 'snowball_arena':
        // Circular pit feeling or just flat with walls
        const arenaWall = Math.abs(x) > 15 ? 5 : 0;
        return slope + arenaWall;

    case 'summit':
        // Flat plateau
        return slope;

    default:
        return slope + baseNoise;
  }
};

export const getBiomeColor = (biome: BiomeType): string => {
    switch (biome) {
        case 'open_slope': return '#F8FAFC'; // Snow White
        case 'ice_cave': return '#E0F2FE'; // Icy Blue
        case 'frozen_rink': return '#BAE6FD'; // Deep Ice
        case 'cocoa_valley': return '#FFEDD5'; // Warm tint
        case 'snowball_arena': return '#F1F5F9'; // Arena Grey
        case 'summit': return '#7DD3FC'; // Glowing Cyan
        default: return '#F8FAFC';
    }
};

export const getObstacleNoise = (x: number, z: number): number => {
    return noise2D(x * 0.1, z * 0.1);
}
