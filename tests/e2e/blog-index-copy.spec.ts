import { expect, test } from '@playwright/test';

test.describe('Blog index copy and UX rewrite', () => {
  test('renders updated narrative, helper text, and disclaimer', async ({ page }) => {
    await page.goto('/#/blog');

    await expect(page.getByRole('heading', { name: 'Resources & Insights' })).toBeVisible();
    await expect(
      page.getByText(
        'Evidence-informed ideas, practical wellness strategies, and updates from the EvoWell community.',
      ),
    ).toBeVisible();
    await expect(
      page.getByText('Educational content only — not medical advice.'),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Articles are for informational and educational purposes only and are not medical advice\./i,
      ),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^All/ })).toBeVisible();
    await expect(page.getByPlaceholder('Search articles…')).toBeVisible();
    await expect(page.getByText('Try “sleep”, “burnout”, “CBT”, “nutrition”')).toBeVisible();
  });

  test('hero conversion links route to directory and providers page', async ({ page }) => {
    await page.goto('/#/blog');

    await page.getByRole('button', { name: 'Looking for support? Browse the Provider Directory →' }).click();
    await expect(page).toHaveURL(/#\/search/);

    await page.goto('/#/blog');
    await page.getByRole('button', { name: 'Are you a provider? Learn about EvoWell for Providers →' }).click();
    await expect(page).toHaveURL(/#\/benefits/);
  });

  test('search no-match state shows clear and view all actions', async ({ page }) => {
    await page.goto('/#/blog');

    await page.getByPlaceholder('Search articles…').fill('nomatchxyz');
    await expect(page.getByRole('heading', { name: 'No matches found.' })).toBeVisible();
    await expect(page.getByText('Try a different keyword or clear filters.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View all' })).toBeVisible();
  });

  test('no-post state renders subscribe CTA when blog store is empty', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('evowell_blogs_v2', '[]');
    });

    await page.goto('/#/blog');
    const noPostsHeading = page.getByRole('heading', { name: 'Articles are coming soon.' });
    await expect(noPostsHeading).toBeVisible();

    const noPostsState = noPostsHeading
      .locator('xpath=ancestor::div[contains(@class,"border-dashed")]')
      .first();
    await expect(noPostsState).toBeVisible();
    await expect(noPostsState.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  });
});
