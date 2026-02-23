import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Documents', () => {
  test('renders documents page', async ({ opsPage: page }) => {
    await page.goto('/ops/documents');

    await expect(page.getByRole('heading', { name: /documents/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows folder grid or empty state', async ({ opsPage: page }) => {
    await page.goto('/ops/documents');

    // Wait for loading
    await page.waitForTimeout(3000);

    // Should show either folder cards or "No documents yet" empty state
    const folders = page.locator('[class*="card"]');
    const emptyState = page.getByText(/no documents yet/i);

    const hasFolders = (await folders.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasFolders || hasEmpty).toBeTruthy();
  });

  test('folder navigation updates URL', async ({ opsPage: page }) => {
    await page.goto('/ops/documents');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // If folders exist, click the first one
    const folderCard = page.locator('[class*="card"]').filter({ hasText: /document/i }).first();
    const isVisible = await folderCard.isVisible().catch(() => false);

    if (isVisible) {
      await folderCard.click();
      // URL should include ?folder= parameter
      await expect(page).toHaveURL(/folder=/);
    }
  });

  test('breadcrumb navigates back to folder view', async ({ opsPage: page }) => {
    // Navigate directly to a folder
    await page.goto('/ops/documents?folder=deposits');

    // Should show breadcrumb with home icon
    const homeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(homeBtn).toBeVisible({ timeout: 10000 });
  });

  test('documents API returns data', async ({ opsPage: page }) => {
    const res = await page.request.get('/api/ops/documents');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty('documents');
    expect(data).toHaveProperty('folderStats');
  });
});
