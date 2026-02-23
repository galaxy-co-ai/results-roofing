import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Contacts', () => {
  test('renders contact list page', async ({ opsPage: page }) => {
    await page.goto('/ops/crm/contacts');

    await expect(page.getByRole('heading', { name: /contacts/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows table with expected columns', async ({ opsPage: page }) => {
    await page.goto('/ops/crm/contacts');

    // Wait for either skeleton rows or real rows to appear
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 15000 });

    // Verify column headers
    for (const header of ['Name', 'Email', 'Phone']) {
      await expect(table.locator('th', { hasText: new RegExp(header, 'i') }).first()).toBeVisible();
    }
  });

  test('has a refresh button', async ({ opsPage: page }) => {
    await page.goto('/ops/crm/contacts');

    const refreshBtn = page.getByRole('button', { name: /refresh/i });
    await expect(refreshBtn).toBeVisible({ timeout: 10000 });
  });

  test('contacts API returns data', async ({ opsPage: page }) => {
    const res = await page.request.get('/api/ops/contacts');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty('contacts');
    expect(Array.isArray(data.contacts)).toBeTruthy();
  });
});
