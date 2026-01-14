import { create } from "zustand";

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

  damageBoss: (amount: number) => void;
  setBossPhase: (phase: number) => void;

  addPhoto: (type: Photo["type"]) => void;
  tickDeveloping: (amount: number) => void;
  addFilm: (amount: number) => void;
  addMatches: (amount: number) => void;

  incrementStat: (stat: keyof GameStore["stats"]) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  highScore: Number(localStorage.getItem("highScore") || 0),
  warmth: 100,
  maxWarmth: 100,
  gameState: "initial",
  playerForm: "kitten",

  bossHealth: 100,
  bossPhase: 1,

  inventory: {
    hasCamera: true,
    hasSled: false,
    photos: [],
    filmRolls: 5,
    matches: 0,
  },

  stats: {
    distanceTraveled: 0,
    enemiesDefeated: 0,
    photosTaken: 0,
    cocoaDrunk: 0,
  },

  setGameState: (state) => set({ gameState: state }),
  setPlayerForm: (form) => set({ playerForm: form }),

  addScore: (points) =>
    set((state) => {
      const newScore = state.score + points;
      if (newScore > state.highScore) {
        localStorage.setItem("highScore", Math.floor(newScore).toString());
        return { score: newScore, highScore: newScore };
      }
      return { score: newScore };
    }),

  damageBoss: (amount) =>
    set((state) => ({ bossHealth: Math.max(0, state.bossHealth - amount) })),
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
    set((_state) => ({
      score: 0,
      warmth: 100,
      gameState: "menu",
      playerForm: "kitten",
      bossHealth: 100,
      bossPhase: 1,
      inventory: {
        hasCamera: true,
        hasSled: false,
        photos: [],
        filmRolls: 5,
        matches: 0,
      },
      stats: {
        distanceTraveled: 0,
        enemiesDefeated: 0,
        photosTaken: 0,
        cocoaDrunk: 0,
      },
    })),
}));
