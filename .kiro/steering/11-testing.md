---
inclusion: fileMatch
fileMatchPattern: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/e2e/**/*.ts']
---

# Testing Guidelines

## Test Stack

- **Unit Tests**: Vitest + Testing Library
- **E2E Tests**: Playwright
- **Environment**: jsdom (for unit tests)

## Unit Testing (Vitest)

### Configuration

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
```

### Test File Naming

- Place tests next to source: `utils.ts` -> `utils.test.ts`
- Or in `src/test/` for integration tests

### Writing Unit Tests

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("RNG", () => {
  let rng: RNG;

  beforeEach(() => {
    rng = new RNG(12345);
  });

  it("should return deterministic values", () => {
    const first = rng.next();
    const second = rng.next();

    const rng2 = new RNG(12345);
    expect(rng2.next()).toBe(first);
    expect(rng2.next()).toBe(second);
  });

  it("should generate values in range", () => {
    for (let i = 0; i < 100; i++) {
      const val = rng.range(0, 10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
    }
  });
});
```

### Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import { MainMenu } from "@/components/UI/MainMenu";

describe("MainMenu", () => {
  it("should render start button", () => {
    render(<MainMenu />);
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });
});
```

### Testing Zustand Stores

```typescript
import { useGameStore } from "@/stores/useGameStore";

describe("GameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("should add score", () => {
    const { addScore, score } = useGameStore.getState();
    addScore(100);
    expect(useGameStore.getState().score).toBe(100);
  });
});
```

## E2E Testing (Playwright)

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "on",
    video: "on",
  },
});
```

### Writing E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("Game Flow", () => {
  test("should start game from menu", async ({ page }) => {
    await page.goto("/");

    // Wait for splash screen to load
    await expect(page.getByText(/overcast/i)).toBeVisible();

    // Click start
    await page.getByRole("button", { name: /start/i }).click();

    // Verify game started
    await expect(page.getByTestId("hud")).toBeVisible();
  });

  test("should show game over on warmth depletion", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /start/i }).click();

    // Wait for game over (would need game state manipulation)
    // ...
  });
});
```

### Mobile Viewport Testing

```typescript
test("should work on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
  await page.goto("/");

  // Test touch interactions
  await page.tap(/* coordinates */);
});
```

## Running Tests

```bash
# Unit tests
pnpm run test              # Run once
pnpm run test:watch        # Watch mode
pnpm run test:ui           # Interactive UI

# E2E tests
pnpm run test:e2e          # Headless
pnpm run test:e2e:ui       # Interactive
```

## Best Practices

1. **Test behavior, not implementation** - Focus on user outcomes
2. **Use deterministic seeds** - Set RNG seeds for reproducible tests
3. **Isolate state** - Reset stores between tests
4. **Minimal mocking** - Prefer real implementations where practical
5. **Describe what, not how** - Test names should describe expected behavior
6. **Screenshot on failure** - Playwright captures evidence automatically
