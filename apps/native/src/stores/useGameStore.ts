import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GameState =
  | "initial"
  | "menu"
  | "playing"
  | "gameover"
  | "paused"
  | "boss_intro"
  | "victory";

export type PlayerForm = "kitten" | "snowman";

export interface Photo {
  id: string;
  timestamp: number;
  type: "glitch" | "enemy" | "boss";
  status: "developing" | "developed";
  progress: number; // 0-100
}

interface GameStore {
  score: number;
  highScore: number;
  warmth: number;
  maxWarmth: number;
  gameState: GameState;
  playerForm: PlayerForm;

  // Movement and gameplay
  velocity: number;
  combo: number;
  comboMultiplier: number;
  currentBiome: string;

  // Player position (for syncing with Babylon)
  playerPosition: { x: number; y: number; z: number };

  // Boss State
  bossHealth: number;
  bossPhase: number;

  inventory: {
    hasCamera: boolean;
    hasSled: boolean;
    photos: Photo[];
    filmRolls: number;
    matches: number;
  };

  // Stats for Achievements
  stats: {
    distanceTraveled: number;
    enemiesDefeated: number;
    photosTaken: number;
    cocoaDrunk: number;
  };

  // Actions
  setGameState: (state: GameState) => void;
  setPlayerForm: (form: PlayerForm) => void;
  addScore: (points: number) => void;
  decreaseWarmth: (amount: number) => void;
  increaseWarmth: (amount: number) => void;

  // Movement actions
  setVelocity: (velocity: number) => void;
  setPlayerPosition: (pos: { x: number; y: number; z: number }) => void;
  setBiome: (biome: string) => void;

  // Combo actions
  incrementCombo: () => void;
  resetCombo: () => void;

  // Game flow
  pauseGame: () => void;
  resumeGame: () => void;
  startGame: () => void;

  damageBoss: (amount: number) => void;
  setBossPhase: (phase: number) => void;

  addPhoto: (type: Photo["type"]) => void;
  tickDeveloping: (amount: number) => void;
  addFilm: (amount: number) => void;
  addMatches: (amount: number) => void;

  incrementStat: (stat: keyof GameStore["stats"]) => void;
  resetGame: () => void;
}

const initialState = {
  score: 0,
  highScore: 0,
  warmth: 100,
  maxWarmth: 100,
  gameState: "initial" as GameState,
  playerForm: "kitten" as PlayerForm,

  // Movement and gameplay
  velocity: 0,
  combo: 0,
  comboMultiplier: 1.0,
  currentBiome: "open_slope",
  playerPosition: { x: 0, y: 1, z: 0 },

  bossHealth: 100,
  bossPhase: 1,

  inventory: {
    hasCamera: true,
    hasSled: false,
    photos: [] as Photo[],
    filmRolls: 5,
    matches: 0,
  },

  stats: {
    distanceTraveled: 0,
    enemiesDefeated: 0,
    photosTaken: 0,
    cocoaDrunk: 0,
  },
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      setGameState: (state) => set({ gameState: state }),
      setPlayerForm: (form) => set({ playerForm: form }),

      addScore: (points) =>
        set((state) => {
          const newScore = state.score + points;
          if (newScore > state.highScore) {
            return { score: newScore, highScore: newScore };
          }
          return { score: newScore };
        }),

      damageBoss: (amount) =>
        set((state) => ({
          bossHealth: Math.max(0, state.bossHealth - amount),
        })),
      setBossPhase: (phase) => set({ bossPhase: phase }),

      decreaseWarmth: (amount) =>
        set((state) => {
          const newWarmth = Math.max(0, state.warmth - amount);
          if (newWarmth <= 0 && state.gameState === "playing") {
            return { warmth: 0, gameState: "gameover" };
          }
          return { warmth: newWarmth };
        }),

      increaseWarmth: (amount) =>
        set((state) => ({
          warmth: Math.min(state.maxWarmth, state.warmth + amount),
        })),

      // Movement actions
      setVelocity: (velocity) => set({ velocity }),
      setPlayerPosition: (pos) => set({ playerPosition: pos }),
      setBiome: (biome) => set({ currentBiome: biome }),

      // Combo actions
      incrementCombo: () =>
        set((state) => {
          const newCombo = state.combo + 1;
          // Multiplier increases with combo: 1.0, 1.5, 2.0, 2.5, 3.0 (max)
          const newMultiplier = Math.min(
            3.0,
            1.0 + Math.floor(newCombo / 5) * 0.5,
          );
          return { combo: newCombo, comboMultiplier: newMultiplier };
        }),
      resetCombo: () => set({ combo: 0, comboMultiplier: 1.0 }),

      // Game flow
      pauseGame: () =>
        set((state) =>
          state.gameState === "playing" ? { gameState: "paused" } : {},
        ),
      resumeGame: () =>
        set((state) =>
          state.gameState === "paused" ? { gameState: "playing" } : {},
        ),
      startGame: () => set({ gameState: "playing", velocity: 15 }),

      addPhoto: (type) =>
        set((state) => {
          if (state.inventory.filmRolls <= 0) return {};

          const newPhoto: Photo = {
            id: Math.random().toString(36).substring(2, 11),
            timestamp: Date.now(),
            type,
            status: "developing",
            progress: 0,
          };

          return {
            inventory: {
              ...state.inventory,
              filmRolls: state.inventory.filmRolls - 1,
              photos: [...state.inventory.photos, newPhoto],
            },
            stats: { ...state.stats, photosTaken: state.stats.photosTaken + 1 },
          };
        }),

      tickDeveloping: (amount) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            photos: state.inventory.photos.map((p) => {
              if (p.status === "developed") return p;
              const newProgress = Math.min(100, p.progress + amount);
              return {
                ...p,
                progress: newProgress,
                status: newProgress >= 100 ? "developed" : "developing",
              };
            }),
          },
        })),

      addFilm: (amount) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            filmRolls: state.inventory.filmRolls + amount,
          },
        })),

      addMatches: (amount) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            matches: state.inventory.matches + amount,
          },
        })),

      incrementStat: (stat) =>
        set((state) => ({
          stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
        })),

      resetGame: () =>
        set((state) => ({
          ...initialState,
          highScore: state.highScore, // Preserve high score
          gameState: "menu",
        })),
    }),
    {
      name: "overcast-glaciers-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        highScore: state.highScore,
        stats: state.stats,
      }),
    },
  ),
);
