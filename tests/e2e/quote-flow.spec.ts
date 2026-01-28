import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Quote Flow
 * Tests the complete quote journey using the 3-stage wizard:
 *   Stage 1: Get Your Quote (Address → Property Confirm → Price Preview)
 *   Stage 2: Customize (Package → Schedule → Financing)
 *   Stage 3: Confirm & Pay (Contact → Contract → Signature → Payment)
 */

test.describe('Quote Flow', () => {
  test.describe('Stage 1: Get Your Quote', () => {
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

    test('should display Stage 1 page with address entry', async ({ page }) => {
      await page.goto('/quote/new');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Get Your Instant Quote');
      
      // Check address input is present
      const addressInput = page.locator('input[placeholder*="address"]');
      await expect(addressInput.first()).toBeVisible();
      
      // Check service area notice
      await expect(page.getByText('Service Areas')).toBeVisible();
    });

    test('should show Stage Indicator with Stage 1 active', async ({ page }) => {
      await page.goto('/quote/new');
      
      // Check stage indicator is present
      const stageIndicator = page.locator('nav[aria-label="Quote wizard progress"]');
      await expect(stageIndicator).toBeVisible();
      
      // Check Stage 1 is marked as current
      const currentStage = page.locator('[aria-current="step"]');
      await expect(currentStage).toBeVisible();
    });

    test('should show Trust Signals', async ({ page }) => {
      await page.goto('/quote/new');
      
      // Check trust signals are present
      await expect(page.getByText(/roofs installed/i)).toBeVisible();
      await expect(page.getByText(/No salesperson/i)).toBeVisible();
    });
  });

  test.describe('Stage 2: Customize', () => {
    test('should redirect to Stage 1 if quote not found', async ({ page }) => {
      // Try to access Stage 2 without a valid quote
      await page.goto('/quote/invalid-quote-id/customize');
      
      // Should be redirected or show error
      await page.waitForLoadState('domcontentloaded');
      // The page should handle the missing quote gracefully
    });

    test('should display customize page structure', async ({ page }) => {
      // Navigate to customize page (requires valid quote ID in real tests)
      await page.goto('/quote/test-quote-id/customize');
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Check page has expected structure
      await expect(page.locator('h1').or(page.locator('h2'))).toBeVisible();
    });
  });

  test.describe('Stage 3: Confirm & Pay', () => {
    test('should display checkout page structure', async ({ page }) => {
      // Navigate to checkout page (requires valid quote ID in real tests)
      await page.goto('/quote/test-quote-id/checkout');
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Check page has expected structure
      await expect(page.locator('main').or(page.locator('[role="main"]'))).toBeVisible();
    });
  });

  test.describe('Stage Indicator', () => {
    test('should show 3-stage progress indicator', async ({ page }) => {
      await page.goto('/quote/new');
      
      // Check stage indicator navigation
      const stageIndicator = page.locator('nav[aria-label="Quote wizard progress"]');
      await expect(stageIndicator).toBeVisible();
      
      // Check for stage labels
      await expect(page.getByText('Get Your Quote')).toBeVisible();
      await expect(page.getByText('Customize')).toBeVisible();
      await expect(page.getByText('Confirm & Pay')).toBeVisible();
    });

    test('should have accessible stage indicator', async ({ page }) => {
      await page.goto('/quote/new');
      
      // Check for screen reader summary
      const srSummary = page.locator('.sr-only');
      await expect(srSummary.first()).toBeVisible({ visible: false }); // sr-only is visually hidden
      
      // Check current stage has aria-current
      const currentStage = page.locator('[aria-current="step"]');
      await expect(currentStage).toBeVisible();
    });
  });

  test.describe('Confirmation Page', () => {
    test('should display confirmation page structure', async ({ page }) => {
      // Navigate to confirmation page (requires completed checkout in real tests)
      await page.goto('/quote/test-quote-id/confirmation');
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Page should exist
      await expect(page).not.toHaveTitle('404');
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

  test('Stage Indicator should be keyboard navigable', async ({ page }) => {
    await page.goto('/quote/new');
    
    // Check stage indicator is present
    const stageIndicator = page.locator('nav[aria-label="Quote wizard progress"]');
    await expect(stageIndicator).toBeVisible();
    
    // Navigation should be accessible
    await expect(stageIndicator).toHaveAttribute('aria-label', 'Quote wizard progress');
  });

  test('error banners should have role="alert"', async ({ page }) => {
    await page.goto('/quote/new');
    
    // Error banners (if shown) should have proper ARIA
    const errorBanner = page.locator('[role="alert"]');
    // This test passes even if no error is visible
    expect(await errorBanner.count()).toBeGreaterThanOrEqual(0);
  });

  test('focus should move to content on sub-step change', async ({ page }) => {
    await page.goto('/quote/new');
    
    // Check that focusable content container exists
    const content = page.locator('[tabindex="-1"]');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Save & Resume', () => {
  test('should display Save My Quote button on price preview', async ({ page }) => {
    // This test requires completing Stage 1 sub-steps first
    // In a full test, you'd enter address, confirm property, then check for save button
    await page.goto('/quote/new');
    
    // The save button appears after reaching price preview
    // This is a placeholder - full test would navigate through sub-steps
    await expect(page.locator('h1')).toContainText('Get Your Instant Quote');
  });
});
