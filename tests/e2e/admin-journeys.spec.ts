import { expect, test, type Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/#/login');
  await page.fill('input[type="email"]', 'admin@evowell.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/.*\/admin/);
}

test.describe('Admin Dashboard Journeys', () => {
  test('navigation uses Providers label and removes Practitioners naming', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.locator('button:has-text("Providers")').first()).toBeVisible();
    await expect(page.locator('text=Practitioners')).toHaveCount(0);
  });

  test('message center resolves real participant names', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/#/admin?tab=messages');
    await expect(page.locator('text=Inbox')).toBeVisible();

    // Deterministic check: identity should not be rendered as unknown placeholders.
    await expect(page.locator('text=Unknown User')).toHaveCount(0);

    // Ensure the inbox renders at least one known participant identity.
    const knownParticipant = page
      .locator(
        'button:has-text("Alice Miller"), button:has-text("Bob Davis"), button:has-text("Sarah Chen"), button:has-text("Marcus Thorne"), button:has-text("Test Client"), button:has-text("Test Provider")',
      )
      .first();
    await expect(knownParticipant).toBeVisible();
  });
});
