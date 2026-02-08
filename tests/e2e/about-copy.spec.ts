import { expect, test } from '@playwright/test';

test.describe('About rewrite trust narrative', () => {
  test('renders the new About narrative and hides legacy modules', async ({ page }) => {
    await page.goto('/#/about');

    await expect(
      page.getByRole('heading', {
        name: 'Building a better system for care-starting with providers.',
      }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Why we built EvoWell' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "We're early-but not new to this space." }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A provider-first ecosystem-by design.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Why sliding-scale membership matters' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Built responsibly-because trust is the product.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Help shape what EvoWell becomes.' }),
    ).toBeVisible();

    await expect(page.getByText(/Specialists across the country/i)).toHaveCount(0);
    await expect(page.getByText(/The people behind the platform/i)).toHaveCount(0);

    await expect(
      page.getByText(
        /EvoWell provides provider discovery and practice tools\. Evo is a navigation assistant and does not provide medical advice\./i,
      ),
    ).toBeVisible();
  });

  test('routes hero, pricing, and participation CTAs correctly', async ({ page }) => {
    await page.goto('/#/about');
    const heroSection = page.locator('section').first();

    await heroSection.getByRole('button', { name: 'Explore the Platform' }).click();
    await expect(page).toHaveURL(/#\/benefits/);

    await page.goto('/#/about');
    await page.locator('section').first().getByRole('button', { name: 'For Providers' }).click();
    await expect(page).toHaveURL(/#\/provider-guide/);

    await page.goto('/#/about');
    await page.getByRole('button', { name: 'See pricing' }).click();
    await expect(page).toHaveURL(/#\/calculator/);

    await page.goto('/#/about');
    await page.getByRole('button', { name: 'Join as a Provider' }).click();
    await expect(page).toHaveURL(/#\/login\?join=true&role=provider/);

    await page.goto('/#/about');
    await page.getByRole('button', { name: 'Explore the Directory' }).click();
    await expect(page).toHaveURL(/#\/search/);

    await page.goto('/#/about');
    await page.getByRole('button', { name: 'Contact us' }).click();
    await expect(page).toHaveURL(/#\/contact/);
  });
});
