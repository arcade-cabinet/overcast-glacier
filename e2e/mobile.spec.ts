import { expect, test } from "@playwright/test";

test.use({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
});

test("mobile layout renders correctly", async ({ page }) => {
  await page.goto("/");

  // Wait for the ENTER SIMULATION button to appear
  const startButton = page.getByRole("button", { name: /ENTER SIMULATION/i });
  await expect(startButton).toBeVisible({ timeout: 10000 });

  // Start Game
  await startButton.click();

  // Check HUD elements
  // Note: Phone button is an icon, checking by label if we added one, or class
  // We added aria-label="Open Phone" in HUD.tsx
  const phoneButton = page.getByLabel("Open Phone");
  await expect(phoneButton).toBeVisible();

  // Open Phone
  await phoneButton.click();

  // Check Flip Phone is visible
  const flipPhone = page.getByText(/SIGNAL: 100%/i);
  await expect(flipPhone).toBeVisible();

  // Close Phone
  await page.getByRole("button", { name: /Close Flip/i }).click();
  await expect(flipPhone).not.toBeVisible();

  await page.screenshot({ path: "e2e-screenshots/mobile-gameplay.png" });
});
