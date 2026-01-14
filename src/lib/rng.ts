// Mulberry32 is a fast, high-quality PRNG
export class RNG {
  private state: number;

  constructor(seed = 123456) {
    this.state = seed;
  }

  // Returns a float between 0 and 1
  next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Range helper
  range(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Integer range helper
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  // Boolean chance
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

// Global instance for general game logic
// We can instantiate separate ones for Audio/Terrain if we want isolated streams
export const GameRNG = new RNG(8888);
