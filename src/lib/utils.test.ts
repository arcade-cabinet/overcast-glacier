import { describe, it, expect } from 'vitest';
import { clamp, lerp } from './utils';

describe('utils', () => {
  describe('clamp', () => {
    it('should clamp a value below the minimum', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    it('should clamp a value above the maximum', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    it('should return the value if it is within range', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });
  });

  describe('lerp', () => {
    it('should interpolate between two values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.1)).toBe(11);
    });
  });
});
