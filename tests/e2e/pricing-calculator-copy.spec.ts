import { expect, test } from '@playwright/test';

test.describe('Pricing calculator sliding-scale copy', () => {
  test('renders new narrative, updates estimates, and uses sliding-scale messaging', async ({ page }) => {
    await page.goto('/#/calculator');

    await expect(
      page.getByRole('heading', { name: "Pay what's fair. Upgrade when the math says so." }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'See the plan that fits your practice today.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Choose your monthly membership (sliding scale)' }),
    ).toBeVisible();

    await expect(page.locator('#estimated-monthly-revenue-value')).toHaveText('$6,000');

    const sessionsInput = page.locator('#sessions-per-month');
    await sessionsInput.focus();
    for (let index = 0; index < 10; index += 1) {
      await page.keyboard.press('ArrowRight');
    }
    await expect(page.locator('#estimated-monthly-revenue-value')).toHaveText('$7,500');

    await page.getByRole('button', { name: 'Access (Minimum)' }).click();
    await expect(page.locator('#selected-plan-message')).toHaveText(
      'A solid starting point. You can increase your contribution anytime as your caseload grows.',
    );

    await page.getByRole('button', { name: 'Sustain (Recommended)' }).click();
    await expect(page.locator('#selected-plan-message')).toHaveText(
      'The recommended choice-balanced for most providers.',
    );

    await page.getByRole('button', { name: 'Sponsor (Supporter)' }).click();
    await expect(page.locator('#selected-plan-message')).toHaveText(
      'Thank you. Your contribution helps subsidize access and accelerates new features.',
    );

    await expect(
      page.getByText(
        'The pricing calculator provides estimates for informational purposes only and does not guarantee savings, income, or outcomes. Always evaluate tools based on your specific practice needs.',
      ),
    ).toBeVisible();
  });

  test('routes CTAs to provider join flow and keeps Set My Price behavior', async ({ page }) => {
    await page.goto('/#/calculator');

    await page.getByRole('button', { name: 'Set My Price' }).first().click();
    await expect(page.locator('#calculator')).toBeVisible();

    await page.getByRole('button', { name: 'Create Provider Profile' }).first().click();
    await expect(page).toHaveURL(/#\/login\?join=true&role=provider/);
  });
});
