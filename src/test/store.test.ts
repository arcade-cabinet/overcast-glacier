import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../stores/useGameStore";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("should initialize with default state", () => {
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.gameState).toBe("menu");
    expect(state.inventory.filmRolls).toBe(5);
  });

  it("should update score", () => {
    useGameStore.getState().addScore(100);
    expect(useGameStore.getState().score).toBe(100);
  });

  it("should decrease warmth", () => {
    useGameStore.getState().decreaseWarmth(10);
    expect(useGameStore.getState().warmth).toBe(90);
  });

  it("should trigger gameover on warmth depletion", () => {
    useGameStore.getState().setGameState("playing");
    useGameStore.getState().decreaseWarmth(100);
    expect(useGameStore.getState().gameState).toBe("gameover");
  });

  it("should add photos to inventory", () => {
    useGameStore.getState().addPhoto("glitch");
    expect(useGameStore.getState().inventory.photos).toHaveLength(1);
    expect(useGameStore.getState().inventory.filmRolls).toBe(4);
  });
});
