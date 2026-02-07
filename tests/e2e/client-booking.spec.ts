import { expect, test, type Page } from '@playwright/test';

async function loginAsClient(page: Page) {
  await page.goto('/#/login');
  await page.fill('input[type="email"]', 'alice.m@gmail.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/.*\/portal/);
}

test('client booking persists and selected slot is no longer available after booking', async ({ page }) => {
  await loginAsClient(page);

  await page.goto('/#/provider/dr-sarah-chen');
  await expect(page.locator('aside[aria-label="Book appointment"]')).toBeVisible();

  const firstSlot = page
    .locator('aside[aria-label="Book appointment"] button')
    .filter({ hasText: /am|pm/i })
    .first();
  await expect(firstSlot).toBeVisible();

  const slotLabel = (await firstSlot.innerText()).trim();
  await firstSlot.click();

  await page.click('aside[aria-label="Book appointment"] button:has-text("Confirm Appointment")');
  await expect(page.locator('text=Request Sent Successfully!')).toBeVisible();

  await page.goto('/#/portal');
  await page.click('button:has-text("Sessions")');
  await expect(page.locator('text=PENDING').first()).toBeVisible();

  await page.goto('/#/provider/dr-sarah-chen');
  await expect(page.locator('aside[aria-label="Book appointment"]')).toBeVisible();
  await expect(
    page.locator('aside[aria-label="Book appointment"] button', { hasText: slotLabel }),
  ).toHaveCount(0);
});
