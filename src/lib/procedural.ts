import { createNoise2D } from 'simplex-noise';

export type BiomeType = 'open_slope' | 'ice_cave' | 'frozen_rink' | 'cocoa_valley' | 'snowball_arena' | 'summit';

const noise2D = createNoise2D();

export const CHUNK_SIZE = 200; // meters

export const getBiomeAt = (z: number): BiomeType => {
  // Use lower frequency noise for biome transitions
  // z is typically negative as we go down the mountain? or positive?
  // Let's assume we move forward in +z or -z. Let's say we move in -z (downhill).
  // Actually, standard runner is usually -z is forward/away into screen, or +z is towards camera.
  // In R3F, usually camera looks down -z. Let's assume player moves towards -z.

  const val = noise2D(0, z * 0.005); // low freq

  if (z < -15000) return 'summit'; // Far distance

  if (val > 0.5) return 'ice_cave';
  if (val > 0.3) return 'frozen_rink';
  if (val < -0.6) return 'cocoa_valley';
  if (val < -0.4) return 'snowball_arena';

  return 'open_slope';
};

export const getHeightAt = (x: number, z: number, biome: BiomeType): number => {
  const baseNoise = noise2D(x * 0.05, z * 0.02) * 2;

  switch (biome) {
    case 'open_slope':
      return baseNoise - (z * 0.2); // Slope downwards
    case 'ice_cave':
      // Tunnel shape? Or just ground. Let's just do ground for now.
      // Caves might need ceiling logic which is complex for heightmap.
      // We might just do walls.
      const tunnel = Math.abs(x) > 10 ? 5 : 0;
      return baseNoise - (z * 0.2) + tunnel;
    case 'frozen_rink':
      return - (z * 0.2); // Flat
    default:
      return baseNoise - (z * 0.2);
  }
};

export const getObstacleNoise = (x: number, z: number): number => {
    return noise2D(x * 0.1, z * 0.1);
}
