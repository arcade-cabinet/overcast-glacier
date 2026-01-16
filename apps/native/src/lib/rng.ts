/**
 * Mulberry32 - A fast, high-quality PRNG for deterministic game logic
 * Portable between web and React Native
 */
export class RNG {
  private state: number;

  constructor(seed = 123456) {
    this.state = seed;
  }

  /** Returns a float between 0 and 1 */
  next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Range helper - returns float between min and max */
  range(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Integer range helper - returns int between min and max (inclusive) */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** Boolean chance - returns true with given probability (0-1) */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Pick random item from array */
  pick<T>(array: T[]): T {
    return array[this.rangeInt(0, array.length - 1)];
  }

  /** Shuffle array in place */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.rangeInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /** Reset with new seed */
  reset(seed: number): void {
    this.state = seed;
  }
}

/** Global instance for general game logic */
export const GameRNG = new RNG(8888);

/** Terrain-specific RNG for deterministic chunk generation */
export const TerrainRNG = new RNG(42);

/** Audio-specific RNG for procedural audio variations */
export const AudioRNG = new RNG(1337);
