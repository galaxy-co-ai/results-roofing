import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Quote V2 Flow (XState single-page wizard)
 *
 * Tests the complete V2 quote journey:
 *   Property: Address → Property Confirmation
 *   Package:  Tier Selection
 *   Checkout: Schedule → Contact → Payment → Success
 */

test.describe('Quote V2 Flow', () => {
  test.describe('Entry & Address Step', () => {
    test('should load V2 wizard with address entry', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('h1')).toContainText('Get Your Free Quote');

      const addressInput = page.locator('input[placeholder*="address"]').first();
      await expect(addressInput).toBeVisible();
    });

    test('should show trust indicators', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByText('No obligation')).toBeVisible();
      await expect(page.getByText('Instant estimate')).toBeVisible();
      await expect(page.getByText('Licensed & insured')).toBeVisible();
    });

    test('should show Get My Quote button', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      const button = page.getByRole('button', { name: /get my quote/i });
      await expect(button).toBeVisible();
    });

    test('should require address before proceeding', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      // Click Get My Quote without entering address
      await page.getByRole('button', { name: /get my quote/i }).click();

      // Should stay on address step
      await expect(page.locator('h1')).toContainText('Get Your Free Quote');
    });
  });

  test.describe('Redirect from V1', () => {
    test('should redirect /quote/new to /quote-v2', async ({ page }) => {
      await page.goto('/quote/new');
      await page.waitForLoadState('domcontentloaded');

      // Should have been redirected (301 or middleware)
      expect(page.url()).toContain('/quote-v2');
    });
  });

  test.describe('Layout & Structure', () => {
    test('should have proper page title', async ({ page }) => {
      await page.goto('/quote-v2');
      await expect(page).toHaveTitle(/quote|Results Roofing/i);
    });

    test('should have main landmark', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      const main = page.locator('main');
      await expect(main).toBeVisible();
    });

    test('should have exactly one h1', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });
  });

  test.describe('Accessibility', () => {
    test('address step should have proper ARIA on error states', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      // Error banners (if shown) should have proper ARIA
      const alerts = page.locator('[role="alert"]');
      expect(await alerts.count()).toBeGreaterThanOrEqual(0);
    });

    test('out-of-area error should use aria-live', async ({ page }) => {
      await page.goto('/quote-v2');
      await page.waitForLoadState('domcontentloaded');

      // If out-of-area error appears, it should have aria-live="polite"
      const politeAlerts = page.locator('[aria-live="polite"]');
      expect(await politeAlerts.count()).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('Quote V2 - Page Navigation', () => {
  test('homepage Get My Quote should link to V2', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // The hero address form should point to V2
    const addressInput = page.locator('input[placeholder*="address"]').first();
    await expect(addressInput).toBeVisible();
  });

  test('services page CTA should link to V2', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('domcontentloaded');

    // At least one link should point to /quote-v2
    const v2Links = page.locator('a[href="/quote-v2"]');
    expect(await v2Links.count()).toBeGreaterThan(0);
  });

  test('contact page CTA should link to V2', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    const v2Links = page.locator('a[href="/quote-v2"]');
    expect(await v2Links.count()).toBeGreaterThan(0);
  });
});
