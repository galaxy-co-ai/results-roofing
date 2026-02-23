import { test, expect } from '@playwright/test';

const OPS_PASSWORD = process.env.OPS_PASSWORD || 'test';

test.describe('Ops Auth', () => {
  test('shows login form when unauthenticated', async ({ page }) => {
    await page.goto('/ops');

    await expect(page.locator('h1')).toContainText('Operations Dashboard');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /access dashboard/i })).toBeVisible();
  });

  test('rejects invalid password', async ({ page }) => {
    await page.goto('/ops');

    await page.locator('input[type="password"]').fill('wrong-password');
    await page.getByRole('button', { name: /access dashboard/i }).click();

    await expect(page.locator('text=Invalid password')).toBeVisible();
    // Should still show login form
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('logs in with valid password via UI', async ({ page }) => {
    await page.goto('/ops');

    await page.locator('input[type="password"]').fill(OPS_PASSWORD);
    await page.getByRole('button', { name: /access dashboard/i }).click();

    // After login, login form should disappear and dashboard content should appear
    await expect(page.locator('input[type="password"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('logs in via API and accesses dashboard', async ({ page }) => {
    const res = await page.request.post('/api/ops/auth', {
      data: { password: OPS_PASSWORD },
    });
    expect(res.ok()).toBeTruthy();

    await page.goto('/ops');
    // Should NOT see login form
    await expect(page.locator('input[type="password"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('logs out via API', async ({ page }) => {
    // Login first
    await page.request.post('/api/ops/auth', {
      data: { password: OPS_PASSWORD },
    });

    // Logout
    const res = await page.request.delete('/api/ops/auth');
    expect(res.ok()).toBeTruthy();

    // Should see login form again
    await page.goto('/ops');
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('protects API endpoints when unauthenticated', async ({ page }) => {
    const res = await page.request.get('/api/ops/dashboard/stats');
    expect(res.status()).toBe(401);
  });
});
