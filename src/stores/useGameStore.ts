import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'gameover' | 'paused';

export interface Photo {
  id: string;
  timestamp: number;
  type: 'glitch' | 'enemy' | 'boss';
  developed: boolean;
}

interface GameStore {
  score: number;
  warmth: number;
  maxWarmth: number;
  gameState: GameState;
  inventory: {
    hasCamera: boolean;
    hasSled: boolean;
    photos: Photo[];
    filmRolls: number;
  };

  // Actions
  setGameState: (state: GameState) => void;
  addScore: (points: number) => void;
  decreaseWarmth: (amount: number) => void;
  increaseWarmth: (amount: number) => void;
  addPhoto: (photo: Photo) => void;
  developPhoto: (id: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  warmth: 100,
  maxWarmth: 100,
  gameState: 'menu',
  inventory: {
    hasCamera: true, // Start with camera for now
    hasSled: false,
    photos: [],
    filmRolls: 0,
  },

  setGameState: (state) => set({ gameState: state }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  decreaseWarmth: (amount) => set((state) => {
    const newWarmth = Math.max(0, state.warmth - amount);
    if (newWarmth === 0 && state.gameState === 'playing') {
      // Game Over condition could be triggered here or in the game loop
      // For now just clamp
    }
    return { warmth: newWarmth };
  }),
  increaseWarmth: (amount) => set((state) => ({ warmth: Math.min(state.maxWarmth, state.warmth + amount) })),
  addPhoto: (photo) => set((state) => ({
    inventory: { ...state.inventory, photos: [...state.inventory.photos, photo] }
  })),
  developPhoto: (id) => set((state) => ({
    inventory: {
      ...state.inventory,
      photos: state.inventory.photos.map(p => p.id === id ? { ...p, developed: true } : p)
    }
  })),
  resetGame: () => set({
    score: 0,
    warmth: 100,
    gameState: 'menu',
    inventory: {
      hasCamera: true,
      hasSled: false,
      photos: [],
      filmRolls: 0,
    }
  })
}));
