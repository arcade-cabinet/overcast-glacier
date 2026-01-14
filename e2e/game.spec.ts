import { test, expect } from '@playwright/test';

test('has title and start button', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Overcast/);

  // Check for the splash screen or main menu
  // The splash screen eventually transitions to the menu
  
  // Wait for the ENTER SIMULATION button to appear
  const startButton = page.getByRole('button', { name: /ENTER SIMULATION/i });
  await expect(startButton).toBeVisible({ timeout: 10000 });
  
  // Click the start button
  await startButton.click();
  
  // Take a screenshot of the started game
  await page.screenshot({ path: 'e2e-screenshots/game-started.png' });
});

test('take a screenshot of the splash screen', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'e2e-screenshots/splash-screen.png' });
  
  // Expect the title "OVERCAST" to be visible
  await expect(page.getByText('OVERCAST')).toBeVisible();
});
