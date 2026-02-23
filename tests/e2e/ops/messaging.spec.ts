import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Messaging — SMS', () => {
  test('renders SMS page', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/sms');

    await expect(page.getByRole('heading', { name: /sms/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows messaging layout with list and chat panes', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/sms');

    // Should show the two-pane layout
    const layout = page.locator('[class*="messagingLayout"]');
    await expect(layout).toBeVisible({ timeout: 10000 });

    // Should show empty state in chat pane
    await expect(page.getByText(/select a conversation/i)).toBeVisible();
  });

  test('has search and filter controls', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/sms');

    const search = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('URL state persists filter', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/sms?filter=unread');
    await expect(page).toHaveURL(/filter=unread/);
  });
});

test.describe('Ops Messaging — Email', () => {
  test('renders email page', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/email');

    await expect(page.getByRole('heading', { name: /email/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows email layout with stat badges', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/email');

    // Should show stat badges (Total, Unread, Starred)
    await expect(page.getByText(/total/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/unread/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/starred/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state in chat pane', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/email');

    await expect(page.getByText(/select an email thread/i)).toBeVisible({ timeout: 10000 });
  });

  test('URL state persists search query', async ({ opsPage: page }) => {
    await page.goto('/ops/messaging/email?q=test');
    await expect(page).toHaveURL(/q=test/);
  });
});
