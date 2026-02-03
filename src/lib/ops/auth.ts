/**
 * Ops Dashboard Authentication Utilities
 */

import { cookies } from 'next/headers';

/**
 * Check if the current request is authenticated for ops dashboard
 */
export async function isOpsAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const opsToken = cookieStore.get('ops_session')?.value;
  const expectedToken = process.env.OPS_SESSION_TOKEN;

  if (!opsToken) return false;
  if (expectedToken && opsToken !== expectedToken) return false;
  return true;
}
