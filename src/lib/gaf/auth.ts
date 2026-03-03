/**
 * GAF Digital Design API — Okta OAuth2 Token Manager
 *
 * Client credentials flow against GAF's Okta tenant.
 * Caches token in memory with 60s safety margin before expiry.
 *
 * Required env vars:
 *   GAF_OKTA_TOKEN_URL, GAF_CLIENT_ID, GAF_CLIENT_SECRET, GAF_API_URL
 */

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getGAFToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const params = new URLSearchParams({
    client_id: process.env.GAF_CLIENT_ID!,
    client_secret: process.env.GAF_CLIENT_SECRET!,
    grant_type: 'client_credentials',
    audience: process.env.GAF_API_URL!,
    scope: [
      'Subscriber:GetSubscriberDetails',
      'Subscriber:SiteStatus',
      'Subscriber:AccountCheck',
      'Subscriber:CoverageCheck',
      'Subscriber:OrderHistory',
      'Subscriber:OrderSearch',
      'Subscriber:Order',
      'Subscriber:Download',
    ].join(' '),
  });

  const res = await fetch(process.env.GAF_OKTA_TOKEN_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');
    throw new Error(`GAF Okta auth failed (${res.status}): ${body}`);
  }

  const data = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}
