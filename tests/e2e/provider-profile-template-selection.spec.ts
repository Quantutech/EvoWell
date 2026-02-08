import { expect, test } from '@playwright/test';

test.describe('Provider profile theme selection', () => {
  test('provider can choose a theme in dashboard and public profile reflects it', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('evowell_auth_token', 'mock-token');
      localStorage.setItem('evowell_auth_user_id', 'u-prov-001');
    });

    await page.goto('/#/console/settings');

    await expect(page.getByRole('heading', { name: 'Public Profile' })).toBeVisible();
    await page.getByRole('button', { name: /Midnight/i }).click();
    await page.getByRole('button', { name: /Ocean/i }).click();
    await page.getByRole('button', { name: /Slate/i }).click();
    await page.getByRole('button', { name: /Forest/i }).click();
    await page.getByRole('button', { name: 'Save Design Choice' }).click();

    await page.goto('/#/provider/dr-sarah-chen-clinical-psychologist');
    await expect(page.getByTestId('provider-profile-theme-forest')).toBeVisible();
  });
});
