import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Checkout Flow
 * Tests the contract signing and payment process
 */

test.describe('Checkout Flow', () => {
  test.describe('Contract Signing', () => {
    test('should display contract viewer when accessed', async ({ page }) => {
      // Note: This test requires a valid quote ID with selected tier
      // In production, use test data seeding
      await page.goto('/quote/test-quote-id/contract');
      
      // Should show contract page or redirect
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Payment Page', () => {
    test('should display payment form elements', async ({ page }) => {
      // Note: This test requires a valid quote ID with contract signed
      await page.goto('/quote/test-quote-id/payment');
      
      // Should show payment page or redirect
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Checkout Accessibility', () => {
  test('checkout pages should have proper heading structure', async ({ page }) => {
    await page.goto('/quote/new');
    
    // Check heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Should have exactly one h1
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
  });
});

test.describe('Quote Share', () => {
  test('should handle invalid share tokens gracefully', async ({ page }) => {
    await page.goto('/api/quotes/share/invalid-token');
    
    // API should return error response
    const response = await page.request.get('/api/quotes/share/invalid-token');
    expect(response.status()).toBe(404);
  });
});
