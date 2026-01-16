---
inclusion: always
---

# Project Structure

## Directory Organization

```
overcast-glacier/
├── apps/
│   ├── native/               # React Native + Babylon.js (ACTIVE)
│   │   ├── App.tsx           # Root component with all UI screens
│   │   ├── app.json          # Expo configuration
│   │   ├── eas.json          # EAS Build profiles
│   │   ├── index.ts          # Entry point
│   │   ├── package.json      # Native app dependencies
│   │   ├── tsconfig.json     # TypeScript config
│   │   ├── assets/           # App icons and splash
│   │   └── src/
│   │       ├── lib/          # Utilities
│   │       │   └── rng.ts    # Deterministic RNG (Mulberry32)
│   │       ├── scenes/       # Babylon.js scenes
│   │       │   └── GameScene.tsx
│   │       └── stores/       # State management
│   │           └── useGameStore.ts
│   │
│   └── web/                  # DEPRECATED - Capacitor version
│       └── ...               # Do not develop further
│
├── docs/                     # Project documentation
│   ├── TRIAGE_1.0.md         # Release triage and roadmap
│   ├── LOGS.md               # Project evolution log
│   ├── VISION.md             # Game vision document
│   └── ARCHITECTURE.md       # Technical architecture
│
├── .kiro/                    # Kiro AI configuration
│   └── steering/             # Development guidelines
│
└── package.json              # Root workspace (if monorepo)
```

## File Naming Conventions

| Directory | Convention | Pattern |
|-----------|------------|---------|
| `src/scenes/` | PascalCase | `GameScene.tsx` |
| `src/lib/` | camelCase | `rng.ts` |
| `src/stores/` | camelCase with `use` prefix | `useGameStore.ts` |
| `src/components/` | PascalCase | `MainMenu.tsx` |
| Tests | Match source + `.test` | `rng.test.ts` |

## Module Boundaries

### Scene Layer (`apps/native/src/scenes/`)
- Babylon.js scene setup and rendering
- Terrain generation
- Camera and lighting configuration
- Game loop via `onBeforeRenderObservable`

### Store Layer (`apps/native/src/stores/`)
- Zustand for game state management
- Player stats, game phase, inventory
- Persists high score to AsyncStorage

### Render Layer (`apps/native/App.tsx`)
- React Native UI components
- Menu, HUD, Pause, Game Over screens
- Haptic feedback integration

### Logic Layer (`apps/native/src/lib/`)
- Deterministic RNG (GameRNG, TerrainRNG, AudioRNG)
- Utilities and helpers

## Import Conventions

Use relative imports within the native app:

```typescript
// From App.tsx
import { useGameStore } from "./src/stores/useGameStore";
import { GameScene } from "./src/scenes/GameScene";

// From scenes/
import { TerrainRNG } from "../lib/rng";
import { useGameStore } from "../stores/useGameStore";
```

## Deprecated: Web Version

The `apps/web/` directory contains the legacy Capacitor-based web version.
**DO NOT** make changes to this directory. It has been deprecated in favor
of the React Native implementation for true native mobile performance.
