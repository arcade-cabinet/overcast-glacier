---
inclusion: always
---

# Project Structure

## Directory Organization

```
overcast-glacier/
├── src/
│   ├── components/      # React components
│   │   ├── UI/          # HUD, menus, overlays
│   │   └── *.tsx        # Game objects (Player, Enemies, etc.)
│   ├── config/          # Game configuration
│   ├── ecs/             # Entity Component System (Miniplex)
│   │   ├── world.ts     # ECS world definition
│   │   ├── entities.tsx # Entity creation
│   │   └── systems.tsx  # ECS systems (Physics, AI, Collision)
│   ├── lib/             # Utilities and core systems
│   │   ├── ai/          # Yuka AI behaviors
│   │   ├── audio/       # Procedural audio synthesis
│   │   ├── procedural.ts # Terrain generation
│   │   ├── rng.ts       # Deterministic RNG
│   │   └── utils.ts     # General utilities
│   ├── scenes/          # Three.js scene compositions
│   ├── stores/          # Zustand state management
│   ├── test/            # Test setup and utilities
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── types.ts         # Shared type definitions
├── e2e/                 # Playwright E2E tests
├── docs/                # Project documentation
│   ├── VISION.md        # Game vision and influences
│   ├── ARCHITECTURE.md  # Technical architecture
│   ├── GAME_DESIGN.md   # Game mechanics documentation
│   └── BRANDING.md      # Visual identity guidelines
├── android/             # Capacitor Android project
├── public/              # Static assets
└── dist/                # Build output (gitignored)
```

## File Naming Conventions

| Directory | Convention | Pattern |
|-----------|------------|---------|
| `components/` | PascalCase | `Player.tsx`, `MainMenu.tsx` |
| `lib/` | camelCase | `procedural.ts`, `rng.ts` |
| `stores/` | camelCase with `use` prefix | `useGameStore.ts` |
| `ecs/` | camelCase | `world.ts`, `systems.tsx` |
| Tests | Match source + `.test` | `utils.test.ts` |

## Module Boundaries

### ECS Layer (`src/ecs/`)
- Owns game state for entities
- Systems run in `useFrame` hooks
- Components are plain TypeScript types

### Store Layer (`src/stores/`)
- Zustand for UI-level game state
- Player stats, game phase, inventory
- Persists high score to localStorage

### Render Layer (`src/components/`)
- React Three Fiber components
- Subscribe to ECS and Zustand state
- Pure rendering, minimal logic

### Logic Layer (`src/lib/`)
- Procedural generation algorithms
- Deterministic RNG system
- AI behaviors (Yuka integration)
- Audio synthesis (Web Audio API)

## Import Conventions

Use the path alias for imports:

```typescript
// Good
import { useGameStore } from "@/stores/useGameStore";
import { GAME_CONFIG } from "@/config/gameConfig";

// Avoid relative paths from deep nesting
// Bad: import { useGameStore } from "../../../stores/useGameStore";
```
