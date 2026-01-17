---
inclusion: always
---

# Fundamentals

## Before Acting

1. Read files before modifying - understand context first
2. Run `npx tsc --noEmit` after code changes in apps/native
3. Run `npm test` to validate unit tests pass
4. Check `git status` before committing

## Making Changes

1. One concern per commit - keep changes focused
2. Run linters/tests locally before pushing
3. Verify TypeScript compiles before consolidating code
4. Test on mobile viewport (vertical orientation) for UI changes

## Project Context

- **Game**: Overcast: Glaciers! - Mobile infinite downhill skiing game
- **Status**: v1.0.0 - React Native Foundation
- **Platform**: React Native + Expo + Babylon.js React Native
- **Primary Target**: Mobile-first, vertical orientation, touch/tilt controls
- **Legacy**: apps/web/ contains deprecated Capacitor version (DO NOT DEVELOP)

## Architecture

```
apps/
├── native/          # Active development (React Native + Babylon.js)
│   └── src/
│       ├── lib/     # Utilities, RNG
│       ├── scenes/  # Babylon.js scenes
│       └── stores/  # Zustand state management
│
└── web/             # DEPRECATED - Do not modify
```

## Authentication & Secrets

- No authentication system currently implemented
- No API keys or secrets in the codebase
- AsyncStorage used for high score persistence

## Critical Paths

- `apps/native/src/scenes/` - Babylon.js scene components
- `apps/native/src/stores/` - Zustand state management
- `apps/native/src/lib/` - RNG, utilities
- `apps/native/App.tsx` - Root component with all UI screens
