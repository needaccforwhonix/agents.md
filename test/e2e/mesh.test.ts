import { test, expect } from '@playwright/test';

test.describe('Agent Mesh E2E', () => {
  test('Mesh simulation starts and renders agents', async ({ page }) => {
    await page.goto('/mesh');

    // Check header
    await expect(page.locator('h1')).toContainText('Agent2Agent Mesh Simulation');

    // Check agents are present
    await expect(page.locator('text=Alpha')).toBeVisible();
    await expect(page.locator('text=Beta')).toBeVisible();
    await expect(page.locator('text=Gamma')).toBeVisible();

    // Check that at least the initial broadcast message appears in the log
    // We wait for the 'What:' label to appear which implies a message is rendered
    await expect(page.locator('text=What:').first()).toBeVisible({ timeout: 5000 });
  });
});
