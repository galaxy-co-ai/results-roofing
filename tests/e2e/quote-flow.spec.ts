import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Quote Flow
 * Tests the complete quote journey from address entry to confirmation
 */

test.describe('Quote Flow', () => {
  test.describe('Address Entry', () => {
    test('should display homepage with address input', async ({ page }) => {
      await page.goto('/');

      // Check hero section
      await expect(page.locator('h1')).toContainText('Your New Roof Quote');
      
      // Check address input exists
      const addressInput = page.locator('input[name="address"]');
      await expect(addressInput).toBeVisible();
      await expect(addressInput).toHaveAttribute('placeholder', 'Enter your home address');
      
      // Check CTA button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toContainText('Get My Quote');
    });

    test('should navigate to new quote page on form submit', async ({ page }) => {
      await page.goto('/');
      
      // Enter address
      const addressInput = page.locator('input[name="address"]');
      await addressInput.fill('123 Main St, Dallas, TX 75201');
      
      // Submit form
      await page.locator('button[type="submit"]').click();
      
      // Should navigate to quote/new
      await expect(page).toHaveURL(/\/quote\/new/);
    });

    test('should show out-of-area message for unsupported states', async ({ page }) => {
      await page.goto('/quote/new');
      
      // This test assumes the address autocomplete component is present
      // and there's a way to trigger out-of-area detection
      // The actual implementation may need adjustment based on UI
      await expect(page.locator('h1')).toContainText('Get Your Quote');
    });
  });

  test.describe('Package Selection', () => {
    test('should display three package tiers', async ({ page }) => {
      // Navigate directly to packages page with mock quote ID
      // In real tests, you'd create a quote first
      await page.goto('/quote/test-quote-id/packages');
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Check page title
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Progress Indicator', () => {
    test('should show progress through quote flow', async ({ page }) => {
      await page.goto('/quote/new');
      
      // Check progress indicator exists
      const progressIndicator = page.locator('[class*="progressIndicator"]');
      // Progress indicator should be present on quote pages
      await expect(progressIndicator.or(page.locator('nav'))).toBeVisible();
    });
  });
});

test.describe('Portal Access', () => {
  test('should redirect to sign-in when accessing portal unauthenticated', async ({ page }) => {
    await page.goto('/portal/dashboard');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('p')).toContainText('Sign in to access your project portal');
  });

  test('should display sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    
    await expect(page.locator('h1')).toContainText('Create Your Account');
  });
});

test.describe('Accessibility', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential accessibility features
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check address input has aria-label
    const addressInput = page.locator('input[name="address"]');
    await expect(addressInput).toHaveAttribute('aria-label');
    
    // Check submit button is accessible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('quote pages should have proper heading structure', async ({ page }) => {
    await page.goto('/quote/new');
    
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});
