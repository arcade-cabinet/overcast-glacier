---
inclusion: always
---

# Development Guidelines

## Code Style

### Biome Configuration

The project uses Biome for linting and formatting:

- **Indent**: 2 spaces
- **Recommended rules**: Enabled
- **Import organization**: Auto-sorted
- **Excluded**: `dist/`, `node_modules/`, `android/`, `pnpm-lock.yaml`

```bash
# Check linting
pnpm exec biome check .

# Auto-fix issues
pnpm exec biome check . --write
```

### TypeScript Standards

- **Target**: ESNext with bundler module resolution
- **Strict mode**: Enabled
- **Path alias**: `@/*` maps to `src/*`
- Use explicit types for function parameters and return values
- Prefer `type` over `interface` for object shapes (project convention)

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Player.tsx`, `MainMenu.tsx` |
| Hooks | camelCase with `use` prefix | `useGameStore.ts` |
| Utilities | camelCase | `procedural.ts`, `rng.ts` |
| Types | PascalCase | `Entity`, `GameState`, `EnemyType` |
| Constants | SCREAMING_SNAKE_CASE | `GAME_CONFIG` |
| ECS Components | camelCase | `position`, `velocity`, `enemyType` |

## Testing Requirements

### Unit Tests (Vitest)

```bash
pnpm run test        # Run once
pnpm run test:watch  # Watch mode
pnpm run test:ui     # Interactive UI
```

- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Setup file: `src/test/setup.ts`
- Environment: jsdom
- Use Testing Library for component tests

### E2E Tests (Playwright)

```bash
pnpm run test:e2e     # Run headless
pnpm run test:e2e:ui  # Interactive mode
```

- Test directory: `e2e/`
- Browser: Chromium only
- Screenshots and video: Enabled
- Retries in CI: 2

## Commit Conventions

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `docs`: Documentation
- `chore`: Maintenance tasks

**Scopes**: `ecs`, `audio`, `ai`, `ui`, `physics`, `mobile`, `ci`

## Package Manager

Use **pnpm** exclusively:

```bash
pnpm install          # Install dependencies
pnpm add <package>    # Add dependency
pnpm add -D <package> # Add dev dependency
```
