import { expect, test } from '@playwright/test';

test.describe('Provider profile public rendering', () => {
  test('public visitor can open preview-theme link on single route', async ({ page }) => {
    await page.goto('/#/provider/dr-sarah-chen-clinical-psychologist?previewTheme=FOREST');

    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
    await expect(page.getByTestId('provider-profile-theme-forest')).toBeVisible();
    await expect(page.getByText('Book appointment')).toBeVisible();
  });

  test('legacy previewTemplate alias maps elevated to forest theme', async ({ page }) => {
    await page.goto('/#/provider/dr-sarah-chen-clinical-psychologist?previewTemplate=ELEVATED');

    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
    await expect(page.getByTestId('provider-profile-theme-forest')).toBeVisible();
  });
});
