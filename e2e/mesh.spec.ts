import { test, expect } from '@playwright/test';

test('Agent Mesh page loads and displays agents', async ({ page }) => {
  await page.goto('/mesh');

  // Check if at least one agent is visible by looking for text "ID:"
  const agentIdLabel = page.locator('text=ID:').first();
  await expect(agentIdLabel).toBeVisible({ timeout: 10000 });

  // Check for controls
  await expect(page.locator('button:has-text("START")').or(page.locator('button:has-text("STOP")'))).toBeVisible();
});
