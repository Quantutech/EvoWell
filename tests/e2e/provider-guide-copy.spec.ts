import { expect, test } from '@playwright/test';

test.describe('Provider Guide Copy And CTA', () => {
  test('renders required narrative sections and disclaimer without placeholders', async ({ page }) => {
    await page.goto('/#/provider-guide');

    await expect(page.getByRole('heading', { name: 'Start your journey with EvoWell.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Built for real practice life.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go live in a few steps.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Verification keeps the network credible.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Make your profile easy to say “yes” to.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Meet Evo—your navigation assistant.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ready to go live?' })).toBeVisible();

    await expect(
      page.getByText(
        'EvoWell supports provider discovery and practice operations. Evo and platform content are informational only and are not medical advice. For emergencies, contact local emergency services.',
      ),
    ).toBeVisible();

    await expect(page.locator('text=/\\[Insert Screenshot/')).toHaveCount(0);
  });

  test('navigates to provider-preselected join flow from primary and final CTAs', async ({ page }) => {
    await page.goto('/#/provider-guide');

    await page.getByRole('button', { name: 'Start Application' }).first().click();
    await expect(page).toHaveURL(/#\/login\?join=true&role=provider/);

    await page.goto('/#/provider-guide');
    const createProfileButton = page.getByRole('button', { name: 'Create Provider Profile' });
    await createProfileButton.scrollIntoViewIfNeeded();
    await createProfileButton.click();
    await expect(page).toHaveURL(/#\/login\?join=true&role=provider/);
  });
});

