import { test, expect } from '@playwright/test';

test('Provider Signup and Onboarding Flow', async ({ page }) => {
  // 1. Navigate to signup
  await page.goto('/#/login');
  await page.click('text=Join Now');

  // 2. Select Provider Role
  await page.click('text=Healthcare Provider');

  // 3. Register
  const email = `provider-${Date.now()}@example.com`;
  await page.fill('input[placeholder="Jane"]', 'John');
  await page.fill('input[placeholder="Doe"]', 'Doe');
  await page.fill('input[placeholder="name@example.com"]', email);
  await page.fill('input[placeholder="••••••••"]', 'Password123!');
  await page.click('button:has-text("Create Account")');

  // 4. Onboarding Wizard
  // Should verify we are on onboarding
  await expect(page).toHaveURL(/.*\/onboarding/);
  await expect(page.locator('h1')).toContainText('Clinical Identity');

  // Step 1
  await page.fill('input[placeholder="e.g., Clinical Psychologist"]', 'Therapist');
  await page.selectOption('select', 'Mental Health Provider');
  await page.click('button:has-text("Continue Setup")');

  // Step 2
  await page.fill('input[placeholder="+1 (555) 000-0000"]', '555-555-5555');
  await page.fill('input[placeholder="e.g., New York"]', 'NY');
  await page.fill('input[placeholder="123 Wellness Ave, Suite 400"]', '123 Main St');
  await page.click('button:has-text("Continue Setup")');

  // Step 3
  // Specialties multi-select - might need to click options
  // Just clicking Continue might work if validation allows empty? MultiSelect doesn't seem required in code?
  // But let's select one if possible.
  await page.click('button:has-text("Continue Setup")');

  // Step 4 (Schedule) - Default schedule should be fine
  await page.click('button:has-text("Continue Setup")');

  // Step 5
  await page.fill('input[placeholder*="Empowering resilience"]', 'Helping you heal');
  await page.fill('textarea[placeholder*="Share your history"]', 'I am a provider.');
  await page.click('button:has-text("Continue Setup")');

  // Step 6 (Verification)
  // Upload dummy files
  await page.setInputFiles('input[type="file"] >> nth=0', {
    name: 'id.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('dummy image')
  });
  await page.setInputFiles('input[type="file"] >> nth=1', {
    name: 'license.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('dummy pdf')
  });
  
  await page.check('input[id="acceptFinal"]');
  await page.click('button:has-text("Submit for Review")');

  // 5. Dashboard Access
  // Should redirect to dashboard (or console for provider)
  await expect(page).toHaveURL(/.*\/console/); // Provider dashboard layout is /console/*
});
