import type { BiomeType } from "../lib/procedural";

export const GAME_CONFIG = {
  player: {
    baseSpeed: 20,
    snowmanSpeed: 10,
    jumpForce: 12,
    gravity: 30,
    lateralSpeed: 5,
    cameraOffset: { x: 0, y: 5, z: 10 },
  },
  biomes: {
    open_slope: { color: "#F0F9FF", enemyDensity: 2, prob: 0.4 },
    ice_cave: { color: "#7DD3FC", enemyDensity: 4, prob: 0.6 },
    frozen_rink: { color: "#E0F2FE", enemyDensity: 3, prob: 0.3 },
    cocoa_valley: { color: "#BAE6FD", enemyDensity: 2, prob: -0.5 },
    summit: { color: "#F8FAFC", enemyDensity: 0, prob: 2.0 }, // Special case
  } as Record<BiomeType, { color: string; enemyDensity: number; prob: number }>,
  enemies: {
    snowman: {
      speed: 5,
      radius: 1.0,
      score: 100,
      behaviors: ["wander", "chase"],
    },
    polar_bear: {
      speed: 8,
      radius: 1.5,
      score: 300,
      behaviors: ["seek", "charge"],
    },
    glitch_imp: {
      speed: 12,
      radius: 0.5,
      score: 500,
      behaviors: ["patrol", "flee"],
    },
  },
  boss: {
    spawnZ: 1000,
    phases: [
      { threshold: 100, name: "Avalanche" },
      { threshold: 75, name: "FrostMorph" },
      { threshold: 50, name: "DigitalDeluge" },
      { threshold: 25, name: "ShatteredCore" },
    ],
  },
  photography: {
    cooldown: 1.0,
    developTime: 100, // ticks
    maxDistance: 50,
    fov: 0.9, // Dot product threshold
  },
};
