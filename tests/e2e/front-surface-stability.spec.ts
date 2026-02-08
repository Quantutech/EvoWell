import { expect, test } from '@playwright/test';

test.describe('Front Surface Stability', () => {
  test('about map marker positions remain stable during hover rerenders', async ({ page }) => {
    await page.goto('/#/about');
    await expect(page.locator('text=providers online')).toBeVisible();

    const markerSelector = 'div[style*="translate(-50%, -50%)"]';
    const markers = page.locator(markerSelector);
    await expect(markers.first()).toBeVisible();

    const before = await page.evaluate((selector) => {
      return Array.from(document.querySelectorAll(selector))
        .slice(0, 6)
        .map((node) => ({
          left: (node as HTMLElement).style.left,
          top: (node as HTMLElement).style.top,
        }));
    }, markerSelector);

    await page.evaluate((selector) => {
      const marker = document.querySelector(selector) as HTMLElement | null;
      if (!marker) return;
      marker.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      marker.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, markerSelector);
    await page.waitForTimeout(200);

    const after = await page.evaluate((selector) => {
      return Array.from(document.querySelectorAll(selector))
        .slice(0, 6)
        .map((node) => ({
          left: (node as HTMLElement).style.left,
          top: (node as HTMLElement).style.top,
        }));
    }, markerSelector);

    expect(after).toEqual(before);
  });

  test('search map does not recenter on provider card hover and zoom buttons are interactive', async ({ page }) => {
    await page.goto('/#/search-map');
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await page.waitForTimeout(600);

    const mapTransformBeforeHover = await page.locator('.leaflet-map-pane').evaluate((node) => (node as HTMLElement).style.transform);

    const firstProviderCard = page.locator('[id^="provider-"]').first();
    await expect(firstProviderCard).toBeVisible();
    await firstProviderCard.hover();
    await page.waitForTimeout(350);

    const mapTransformAfterHover = await page.locator('.leaflet-map-pane').evaluate((node) => (node as HTMLElement).style.transform);
    expect(mapTransformAfterHover).toBe(mapTransformBeforeHover);

    const zoomIn = page.getByRole('button', { name: 'Zoom in' });
    const zoomOut = page.getByRole('button', { name: 'Zoom out' });

    await expect(zoomIn).toBeEnabled();
    await expect(zoomOut).toBeEnabled();
    await zoomIn.click();
    await zoomOut.click();
  });
});
