---
inclusion: always
---

# Fundamentals

## Before Acting

1. Read files before modifying - understand context first
2. Run `pnpm exec biome check .` after code changes
3. Run `pnpm run test` to validate unit tests pass
4. Check `git status` before committing

## Making Changes

1. One concern per commit - keep changes focused
2. Run linters/tests locally before pushing
3. Verify builds with `pnpm run build` before consolidating code
4. Test on mobile viewport (vertical orientation) for UI changes

## Project Context

- **Game**: Overcast: Glaciers! - Mobile infinite downhill skiing game
- **Status**: v1.0.0 release candidate
- **Platform**: Capacitor (Android/iOS/Web)
- **Primary Target**: Mobile-first, vertical orientation, touch/tilt controls

## Authentication & Secrets

- No authentication system currently implemented
- No API keys or secrets in the codebase
- localStorage used for high score persistence only

## Critical Paths

- `src/ecs/` - Entity Component System (Miniplex) - core game logic
- `src/stores/` - Zustand state management
- `src/lib/` - Utilities, RNG, AI, Audio systems
- `src/config/gameConfig.ts` - Central game configuration
