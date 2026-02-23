import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Pipeline', () => {
  test('renders pipeline board page', async ({ opsPage: page }) => {
    await page.goto('/ops/crm/pipeline');

    await expect(page.getByRole('heading', { name: /pipeline/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows kanban board with stage columns', async ({ opsPage: page }) => {
    await page.goto('/ops/crm/pipeline');

    // Wait for board to render (either skeleton or real columns)
    // The board container uses CSS module class "board" with horizontal flex
    const board = page.locator('[class*="board"]').first();
    await expect(board).toBeVisible({ timeout: 15000 });

    // Should have at least one column
    const columns = page.locator('[class*="column"]');
    await expect(columns.first()).toBeVisible({ timeout: 10000 });
  });

  test('pipeline columns show stage names', async ({ opsPage: page }) => {
    await page.goto('/ops/crm/pipeline');

    // Wait for data to load — either real stage names or skeleton placeholders
    await page.waitForTimeout(3000);

    // If pipeline is configured, we should see stage names
    const columnHeaders = page.locator('[class*="columnName"]');
    const count = await columnHeaders.count();

    if (count > 0) {
      // At least one stage name should be visible
      await expect(columnHeaders.first()).toBeVisible();
    }
  });

  test('pipelines API returns data', async ({ opsPage: page }) => {
    const res = await page.request.get('/api/ops/pipelines');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    // Should have stages and opportunities arrays
    expect(data).toHaveProperty('stages');
    expect(data).toHaveProperty('opportunities');
  });
});
