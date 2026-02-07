import { test, expect } from '@playwright/test';

test('Admin Moderation Flow', async ({ page }) => {
  // 1. Admin Login
  await page.goto('/#/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  
  // Wait for dashboard
  await expect(page).toHaveURL(/.*\/admin/);

  // 2. Go to Providers Tab
  await page.click('button:has-text("Providers")');

  // 3. Find Pending Provider
  await page.click('button:has-text("PENDING")');
  
  // Wait for data
  await expect(page.locator('table')).toBeVisible();

  // Check if there are pending providers
  const approveBtn = page.locator('tbody button:has-text("Approve")').first();
  
  if (await approveBtn.isVisible()) {
      await approveBtn.click();
      // Verify button is gone (row might remain if optimistic update or we verify badge change)
      // If we filtered by PENDING, row should vanish or list refresh
      await expect(approveBtn).not.toBeVisible();
  } else {
      console.log('No pending providers found to approve - skipping approval step');
  }
  
  // 4. Verify in APPROVED list
  await page.click('button:has-text("APPROVED")');
  await expect(page.locator('tbody tr').first()).toBeVisible();
});
