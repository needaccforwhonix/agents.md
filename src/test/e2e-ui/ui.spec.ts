import { test, expect } from '@playwright/test';

test('Landing page loads', async ({ page }) => {
  await page.goto('/');

  // Test the title of the document
  await expect(page).toHaveTitle(/AGENTS.md/);
});
