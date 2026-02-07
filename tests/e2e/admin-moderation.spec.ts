import { expect, test, type Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/#/login');
  await page.fill('input[type="email"]', 'admin@evowell.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/.*\/admin/);
}

test('pending provider approval works from Providers module', async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto('/#/admin?tab=providers');
  await page.click('button:has-text("PENDING")');
  await expect(page.locator('table')).toBeVisible();

  const approveButtons = page.locator('tbody button:has-text("Approve")');
  const initialPendingCount = await approveButtons.count();
  const hasPending = initialPendingCount > 0;

  test.skip(!hasPending, 'No pending providers available in current seed state.');

  await approveButtons.first().click();
  await expect
    .poll(async () => page.locator('tbody button:has-text("Approve")').count())
    .toBeLessThan(initialPendingCount);

  await page.click('button:has-text("APPROVED")');
  await expect.poll(async () => page.locator('tbody tr').count()).toBeGreaterThan(0);
});
