import { expect, test } from '@playwright/test';

test.describe('Homepage rewrite and sell-flow routing', () => {
  test('renders the new homepage narrative and trust sections', async ({ page }) => {
    await page.goto('/#/');

    await expect(
      page.getByRole('heading', { name: 'The next evolution in care-built for trust.' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose your path.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Clear steps. Less friction.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Provider Exchange' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Built with responsibility.' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Provider-first profile design choices.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'EvoWell is just getting started. Join early.' }),
    ).toBeVisible();
  });

  test('routes key CTAs and opens Evo modal from home', async ({ page }) => {
    await page.goto('/#/');
    const heroSection = page.locator('section').first();

    await heroSection.getByRole('button', { name: 'Find a Provider' }).click();
    await expect(page).toHaveURL(/#\/search/);

    await page.goto('/#/');
    await page.locator('section').first().getByRole('button', { name: 'For Providers' }).click();
    await expect(page).toHaveURL(/#\/benefits/);

    await page.goto('/#/');
    await page.getByRole('button', { name: 'Sell a Resource' }).click();
    await expect(page).toHaveURL(/#\/login\?join=true&role=provider&next=%2Fexchange%2Fsell/);

    await page.goto('/#/');
    await page.locator('section').first().getByRole('button', { name: 'Chat with Evo' }).click();
    await expect(page.getByRole('heading', { name: "Hi, I'm Evo." })).toBeVisible();
  });
});
