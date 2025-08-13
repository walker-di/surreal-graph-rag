import { expect, test } from '@playwright/test';

test('file-upload page renders H1', async ({ page }) => {
  await page.goto('/file-upload');
  await expect(
    page.getByRole('heading', { level: 1, name: 'File Upload System' })
  ).toBeVisible();
});
