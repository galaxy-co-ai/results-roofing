import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Dashboard', () => {
  test('renders dashboard with stat cards', async ({ opsPage: page }) => {
    await page.goto('/ops');

    // Should see the dashboard heading
    await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible({
      timeout: 15000,
    });

    // Stat cards should be present (4 cards: contacts, pipeline, tickets, documents)
    const statCards = page.locator('[class*="card"]').filter({ hasText: /total|open|active|pipeline/i });
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('navigates to all ops sections via sidebar', async ({ opsPage: page }) => {
    await page.goto('/ops');

    // Check key navigation links exist
    const nav = page.locator('nav, aside, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });

    // Verify key section links
    for (const section of ['Dashboard', 'Contacts', 'Pipeline', 'SMS', 'Email', 'Support', 'Documents']) {
      const link = page.getByRole('link', { name: new RegExp(section, 'i') }).first();
      await expect(link).toBeVisible();
    }
  });

  test('dashboard loads stats from API', async ({ opsPage: page }) => {
    // Verify API returns data
    const res = await page.request.get('/api/ops/dashboard/stats');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty('stats');
  });
});
