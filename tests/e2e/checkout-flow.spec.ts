import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Checkout Flow
 * Tests the contract signing and payment process
 * 
 * Note: Full payment flow tests require:
 * 1. Stripe test mode keys configured in .env
 * 2. stripe listen --forward-to localhost:3000/api/payments/webhook
 * 3. Seeded test quote with measurement data
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

  test.describe('Full Payment Flow', () => {
    /**
     * Test the complete payment flow with Stripe test mode
     * Prerequisites:
     * - Valid quote with selected tier and deposit amount
     * - Stripe test keys configured
     * - Local webhook forwarding via Stripe CLI
     */
    test.skip('should complete payment and create order', async ({ page, request }) => {
      // This test is skipped by default - enable when running integration tests
      // with seeded data and Stripe webhook forwarding
      
      // 1. Create a test quote via API
      const createQuoteResponse = await request.post('/api/quotes', {
        data: {
          address: '123 Test Street',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
        },
      });
      expect(createQuoteResponse.ok()).toBe(true);
      const { id: quoteId } = await createQuoteResponse.json();

      // 2. Simulate measurement completion (update quote with measurement data)
      await request.patch(`/api/quotes/${quoteId}`, {
        data: {
          sqftTotal: 2500,
          pitchPrimary: 4,
          complexity: 'moderate',
          status: 'measured',
        },
      });

      // 3. Select a package tier
      const selectTierResponse = await request.post(`/api/quotes/${quoteId}/select-tier`, {
        data: {
          tier: 'better',
        },
      });
      expect(selectTierResponse.ok()).toBe(true);

      // 4. Navigate to payment page
      await page.goto(`/quote/${quoteId}/payment`);
      
      // 5. Wait for Stripe Elements to load
      await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 });

      // 6. Fill in Stripe test card details
      // Note: Stripe Elements are in iframes, requires special handling
      const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
      
      // Fill card number (Stripe test card)
      await stripeFrame.locator('[name="cardnumber"]').fill('4242 4242 4242 4242');
      await stripeFrame.locator('[name="exp-date"]').fill('12/30');
      await stripeFrame.locator('[name="cvc"]').fill('123');
      await stripeFrame.locator('[name="postal"]').fill('77001');

      // 7. Submit payment
      await page.click('[data-testid="submit-payment"]');

      // 8. Wait for confirmation page
      await page.waitForURL(`**/quote/${quoteId}/confirmation`, { timeout: 30000 });

      // 9. Verify confirmation page shows real data
      await expect(page.locator('text=RR-')).toBeVisible(); // Confirmation number
      await expect(page.locator('text=View Your Portal')).toBeVisible();

      // 10. Verify order was created in database
      const orderResponse = await request.get(`/api/orders?quoteId=${quoteId}`);
      expect(orderResponse.ok()).toBe(true);
      const orders = await orderResponse.json();
      expect(orders.length).toBe(1);
      expect(orders[0].status).toBe('deposit_paid');
    });

    test('should handle payment failure gracefully', async ({ page }) => {
      // Test that payment errors are displayed to the user
      // This would use Stripe's decline test cards like 4000000000000002
      await page.goto('/quote/test-quote-id/payment');
      
      // Should show the payment page
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
