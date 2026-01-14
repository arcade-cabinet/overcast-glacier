import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../config/gameConfig";

describe("GAME_CONFIG", () => {
  it("should have player settings", () => {
    expect(GAME_CONFIG.player.baseSpeed).toBeGreaterThan(0);
    expect(GAME_CONFIG.player.gravity).toBeDefined();
  });

  it("should have valid biome configuration", () => {
    expect(GAME_CONFIG.biomes.open_slope).toBeDefined();
    expect(GAME_CONFIG.biomes.ice_cave.prob).toBeGreaterThan(0);
  });

  it("should have enemy definitions", () => {
    expect(GAME_CONFIG.enemies.snowman.speed).toBeDefined();
    expect(GAME_CONFIG.enemies.polar_bear.behaviors).toContain("seek");
  });
});
