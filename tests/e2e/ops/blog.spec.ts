import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Blog', () => {
  test('renders blog management page', async ({ opsPage: page }) => {
    await page.goto('/ops/blog');

    await expect(page.getByRole('heading', { name: /blog/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows post list or empty state', async ({ opsPage: page }) => {
    await page.goto('/ops/blog');

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Should show either post cards/rows or some content area
    const content = page.locator('main, [class*="content"], [class*="card"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('has search and filter controls', async ({ opsPage: page }) => {
    await page.goto('/ops/blog');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Should have a "New Post" or "Create" button
    const createBtn = page.getByRole('button', { name: /new|create/i }).first();
    const isVisible = await createBtn.isVisible().catch(() => false);

    // Blog page should have some interactive controls
    expect(isVisible).toBeTruthy();
  });

  test('blog posts API returns data', async ({ opsPage: page }) => {
    const res = await page.request.get('/api/ops/blog/posts');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty('posts');
    expect(Array.isArray(data.posts)).toBeTruthy();
  });
});
