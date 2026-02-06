import { test, expect } from '@playwright/test';

test('Client Booking Flow', async ({ page }) => {
  // 1. Signup
  await page.goto('/#/login');
  await page.click('text=Join Now');
  await page.click('text=Patient / Client');
  
  const email = `client-${Date.now()}@example.com`;
  await page.fill('input[placeholder="Jane"]', 'Alice');
  await page.fill('input[placeholder="Doe"]', 'Smith');
  await page.fill('input[placeholder="name@example.com"]', email);
  await page.fill('input[placeholder="••••••••"]', 'Password123!');
  await page.click('button:has-text("Create Account")');
  
  // Should land on portal home
  await expect(page).toHaveURL(/.*\/portal/);

  // 2. Search
  await page.goto('/#/search');
  await expect(page.locator('input[type="text"]')).toBeVisible();
  
  // Wait for results
  await page.waitForTimeout(1000); 
  
  // 3. View Profile
  // Click first result
  const firstProfile = page.locator('a[href^="#/provider/"]').first();
  if (await firstProfile.count() > 0) {
      await firstProfile.click();
      await expect(page).toHaveURL(/.*\/provider\/.*/);
      
      // 4. Verify Booking Option
      await expect(page.locator('text=Book Appointment').or(page.locator('text=Schedule'))).toBeVisible();
  } else {
      console.log('No providers found in search');
  }
});
