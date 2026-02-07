import { expect, test, type Page } from '@playwright/test';

async function loginAsClient(page: Page) {
  await page.goto('/#/login');
  await page.fill('input[type="email"]', 'alice.m@gmail.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/.*\/portal/);
}

test('client journal and documents persist after refresh', async ({ page }) => {
  await loginAsClient(page);

  await page.click('button:has-text("Health Journal")');
  await expect(page.locator('text=Clinical Health Journal')).toBeVisible();

  const note = `Journal entry ${Date.now()}`;
  await page.fill(
    'textarea[placeholder="How are you feeling today? Any breakthroughs or challenges?"]',
    note,
  );
  await page.click('button:has-text("Securely Save Entry")');
  await expect(page.locator(`text=${note}`)).toBeVisible();

  await page.click('button:has-text("Documents")');
  await expect(page.locator('text=My Documents')).toBeVisible();
  const documentLinks = page.locator('a[target="_blank"]');
  const initialDocumentCount = await documentLinks.count();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'lab-report.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('lab values'),
  });

  await expect.poll(async () => documentLinks.count()).toBe(initialDocumentCount + 1);

  await page.reload();
  await page.click('button:has-text("Health Journal")');
  await expect(page.locator(`text=${note}`)).toBeVisible();

  await page.click('button:has-text("Documents")');
  await expect.poll(async () => page.locator('a[target="_blank"]').count()).toBeGreaterThanOrEqual(
    initialDocumentCount + 1,
  );
});
