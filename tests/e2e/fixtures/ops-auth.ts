import { test as base, expect } from '@playwright/test';

/**
 * Playwright fixture that authenticates against the ops dashboard
 * before each test. Uses the API endpoint for fast, headless auth.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/ops-auth';
 *   test('my ops test', async ({ opsPage }) => { ... });
 */
export const test = base.extend<{ opsPage: ReturnType<typeof base['page'] extends Promise<infer P> ? P : never> }>({
  opsPage: async ({ page }, use) => {
    const password = process.env.OPS_PASSWORD || 'test';

    const res = await page.request.post('/api/ops/auth', {
      data: { password },
    });

    if (!res.ok()) {
      throw new Error(
        `Ops auth failed (${res.status()}). Set OPS_PASSWORD env var to match your .env.local value.`,
      );
    }

    await use(page);
  },
});

export { expect };
