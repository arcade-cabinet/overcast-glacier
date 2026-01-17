# Kiro Configuration

This directory contains Kiro steering documents that guide AI-assisted development for **Overcast: Glaciers!**

## Structure

```
.kiro/
├── README.md           # This file
├── settings.json       # Project configuration
└── steering/           # Development guidelines
    ├── 00-fundamentals.md      # Core development rules
    ├── 00-development.md       # Code style and conventions
    ├── 01-pr-workflow.md       # Pull request process
    ├── 02-ci.md                # CI/CD guidelines
    ├── 03-structure.md         # Project structure
    ├── 04-typescript.md        # TypeScript patterns
    ├── 05-ecs-architecture.md  # Entity Component System
    ├── 06-audio.md             # Procedural audio system
    ├── 07-ai-system.md         # Yuka AI integration
    ├── 08-procedural-generation.md  # Terrain/content generation
    ├── 09-mobile-first.md      # Mobile development
    ├── 10-three-fiber.md       # React Three Fiber patterns
    ├── 11-testing.md           # Testing guidelines
    └── 12-branding.md          # Visual identity
```

## Steering Document Format

Each steering document uses YAML frontmatter to control when it's applied:

```yaml
---
inclusion: always           # Always include
# OR
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']  # Only for matching files
---
```

## Key Concepts

### ECS + React Pattern
The game uses Miniplex for entity management, bridged to React Three Fiber for rendering. See `05-ecs-architecture.md`.

### Procedural Everything
- **Terrain**: Noise-based biome generation
- **Audio**: Web Audio API synthesis
- **Content**: Deterministic RNG-driven spawning

### Mobile-First
All UI/UX decisions prioritize mobile touch/tilt controls. See `09-mobile-first.md`.

## Quick Reference

| Task | Command |
|------|---------|
| Dev server | `pnpm run dev` |
| Unit tests | `pnpm run test` |
| E2E tests | `pnpm run test:e2e` |
| Lint | `pnpm exec biome check .` |
| Build | `pnpm run build` |
| Mobile sync | `pnpm run cap:sync` |

## Related Documentation

- `/docs/VISION.md` - Game vision and influences
- `/docs/ARCHITECTURE.md` - Technical architecture
- `/docs/GAME_DESIGN.md` - Game mechanics
- `/docs/BRANDING.md` - Visual identity
