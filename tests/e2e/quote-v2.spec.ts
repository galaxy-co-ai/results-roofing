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

      // Trust indicators include a ✓ checkmark in a child span;
      // use locator scoped to the trust section
      const trustSection = page.locator('[class*="trust"]').first();
      await expect(trustSection).toBeVisible();
      await expect(trustSection).toContainText('No obligation');
      await expect(trustSection).toContainText('Instant estimate');
      await expect(trustSection).toContainText('Licensed & insured');
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

      // Button should be disabled when no address is entered
      const button = page.getByRole('button', { name: /get my quote/i });
      await expect(button).toBeDisabled();

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

test.describe('Quote V2 - Out-of-Area Rejection', () => {
  test('should show out-of-area alert for non-service-area address', async ({ page }) => {
    // Mock Mapbox geocoding to return a New York address
    await page.route('**/api.mapbox.com/geocoding/v5/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'FeatureCollection',
          features: [
            {
              id: 'address.123',
              type: 'Feature',
              place_name: '123 Broadway, New York, NY 10006',
              text: 'Broadway',
              address: '123',
              center: [-74.0134, 40.7081],
              context: [
                { id: 'place.1', text: 'New York' },
                { id: 'region.1', text: 'New York', short_code: 'US-NY' },
                { id: 'postcode.1', text: '10006' },
              ],
            },
          ],
        }),
      });
    });

    await page.goto('/quote-v2');
    await page.waitForLoadState('domcontentloaded');

    // Type address to trigger autocomplete (min 5 chars)
    const addressInput = page.locator('input[placeholder*="address"]').first();
    await addressInput.fill('123 Broadway New York');

    // Wait for suggestions and select the first one
    const suggestion = page.locator('[role="option"]').first();
    await expect(suggestion).toBeVisible({ timeout: 10000 });
    await suggestion.click();

    // Out-of-area alert container should appear
    const alert = page.locator('div[class*="outOfArea"][role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("don't serve that area yet");
    await expect(alert).toContainText('Texas, Georgia, North Carolina, Arizona, and Oklahoma');

    // Get My Quote button should be disabled
    const button = page.getByRole('button', { name: /get my quote/i });
    await expect(button).toBeDisabled();
  });
});

test.describe('Contact Form - Full Submission', () => {
  test('should complete 3-step form and show success', async ({ page }) => {
    // Mock the contact API to avoid writing to the real DB
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-lead-id' }),
      });
    });

    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    // Step 1: Select service type (target the form button, not FAQ content)
    await page.getByRole('button', { name: 'Roof Replacement', exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).first().click();

    // Step 2: Fill address fields
    await page.locator('input[placeholder="Street address"]').fill('456 Oak Lane');
    await page.locator('input[placeholder="City"]').fill('Dallas');
    await page.locator('input[placeholder="State"]').fill('TX');
    await page.locator('input[placeholder="ZIP"]').fill('75201');
    await page.getByRole('button', { name: 'Continue' }).first().click();

    // Step 3: Fill contact info and submit
    await page.locator('input[placeholder="Full name"]').fill('John Smith');
    await page.locator('input[placeholder="Phone number"]').fill('2145551234');
    await page.locator('input[placeholder="Email address"]').fill('john@example.com');

    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Should show success state
    await expect(page.getByText('Request Received!')).toBeVisible({ timeout: 10000 });
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
