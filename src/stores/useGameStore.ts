import { create } from "zustand";

export type GameState = "initial" | "menu" | "playing" | "gameover" | "paused";
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
  warmth: number;
  maxWarmth: number;
  gameState: GameState;
  playerForm: PlayerForm;

  inventory: {
    hasCamera: boolean;
    hasSled: boolean;
    photos: Photo[];
    filmRolls: number;
  };

  // Actions
  setGameState: (state: GameState) => void;
  setPlayerForm: (form: PlayerForm) => void;
  addScore: (points: number) => void;
  decreaseWarmth: (amount: number) => void;
  increaseWarmth: (amount: number) => void;

  addPhoto: (type: Photo["type"]) => void;
  tickDeveloping: (amount: number) => void;

  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  warmth: 100,
  maxWarmth: 100,
  gameState: "initial",
  playerForm: "kitten",

  inventory: {
    hasCamera: true,
    hasSled: false,
    photos: [],
    filmRolls: 5, // Start with some film
  },

  setGameState: (state) => set({ gameState: state }),
  setPlayerForm: (form) => set({ playerForm: form }),

  addScore: (points) => set((state) => ({ score: state.score + points })),

  decreaseWarmth: (amount) =>
    set((state) => {
      const newWarmth = Math.max(0, state.warmth - amount);
      return { warmth: newWarmth };
    }),

  increaseWarmth: (amount) =>
    set((state) => ({
      warmth: Math.min(state.maxWarmth, state.warmth + amount),
    })),

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

  resetGame: () =>
    set({
      score: 0,
      warmth: 100,
      gameState: "menu",
      playerForm: "kitten",
      inventory: {
        hasCamera: true,
        hasSled: false,
        photos: [],
        filmRolls: 5,
      },
    }),
}));
