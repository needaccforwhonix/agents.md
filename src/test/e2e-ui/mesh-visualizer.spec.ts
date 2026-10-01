import { test, expect } from '@playwright/test';

test('MeshVisualizer page loads, has Start Simulation and Clear State buttons', async ({ page }) => {
  await page.goto('/mesh');

  // Should have the heading
  await expect(page.locator('h1')).toContainText('Agent2Agent Broadcast Mesh Simulation');

  // Should have the Start Simulation button
  const startButton = page.locator('button:has-text("Start Simulation")');
  await expect(startButton).toBeVisible();

  // Should have the Clear State button
  const clearButton = page.locator('button:has-text("Clear State")');
  await expect(clearButton).toBeVisible();

  // Click Clear State
  await clearButton.click();
});
