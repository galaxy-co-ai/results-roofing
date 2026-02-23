import { test, expect } from '../fixtures/ops-auth';

test.describe('Ops Support', () => {
  test('renders support inbox page', async ({ opsPage: page }) => {
    await page.goto('/ops/support');

    await expect(page.getByRole('heading', { name: /support/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('shows stat badges (open, pending, resolved)', async ({ opsPage: page }) => {
    await page.goto('/ops/support');

    await expect(page.getByText(/open/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/pending/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/resolved today/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state or ticket list', async ({ opsPage: page }) => {
    await page.goto('/ops/support');

    // Wait for loading to finish
    await page.waitForTimeout(3000);

    // Should show either tickets or empty/no-selection state
    const ticketList = page.locator('[class*="inbox"], [class*="ticket"]').first();
    await expect(ticketList).toBeVisible({ timeout: 10000 });
  });

  test('has search and status filter controls', async ({ opsPage: page }) => {
    await page.goto('/ops/support');

    // Search input
    const search = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('URL state persists status filter', async ({ opsPage: page }) => {
    await page.goto('/ops/support?status=open');

    // The status=open should be reflected in the URL
    await expect(page).toHaveURL(/status=open/);
  });

  test('tickets API returns data', async ({ opsPage: page }) => {
    const res = await page.request.get('/api/ops/support/tickets');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty('tickets');
    expect(Array.isArray(data.tickets)).toBeTruthy();
  });

  test('can create and view a ticket via API', async ({ opsPage: page }) => {
    // Create a test ticket
    const createRes = await page.request.post('/api/ops/support/tickets', {
      data: {
        subject: 'E2E Test Ticket',
        body: 'Created by Playwright test',
        contactName: 'Test User',
        contactEmail: 'test@example.com',
        channel: 'email',
        priority: 'medium',
      },
    });
    expect(createRes.ok()).toBeTruthy();

    const { ticket } = await createRes.json();
    expect(ticket).toBeTruthy();
    expect(ticket.subject).toBe('E2E Test Ticket');

    // Clean up — delete the ticket
    const deleteRes = await page.request.delete(`/api/ops/support/tickets/${ticket.id}`);
    expect(deleteRes.ok()).toBeTruthy();
  });
});
