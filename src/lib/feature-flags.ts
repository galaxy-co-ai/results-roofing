/**
 * Feature Flag System for Quote Wizard V2 Rollout
 *
 * Environment variables:
 * - QUOTE_V2_ROLLOUT_PERCENTAGE: 0-100, percentage of users to see v2 (default: 0)
 * - QUOTE_V2_FORCE_ENABLED: 'true' to force v2 for all users (default: false)
 *
 * Query parameters (for testing):
 * - ?quote_v2=true: Force v2 for this session
 * - ?quote_v2=false: Force v1 for this session
 */

const COOKIE_NAME = 'rr_quote_version';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Get the quote version for a user
 * Returns 'v1' or 'v2'
 */
export function getQuoteVersion(options: {
  cookies?: { get: (name: string) => { value: string } | undefined };
  searchParams?: { get: (name: string) => string | null };
}): 'v1' | 'v2' {
  const { cookies, searchParams } = options;

  // Check for force override via environment
  if (process.env.QUOTE_V2_FORCE_ENABLED === 'true') {
    return 'v2';
  }

  // Check for query parameter override
  if (searchParams) {
    const forceParam = searchParams.get('quote_v2');
    if (forceParam === 'true') return 'v2';
    if (forceParam === 'false') return 'v1';
  }

  // Check for existing cookie
  if (cookies) {
    const existingVersion = cookies.get(COOKIE_NAME)?.value;
    if (existingVersion === 'v1' || existingVersion === 'v2') {
      return existingVersion;
    }
  }

  // Determine version based on rollout percentage
  const rolloutPercentage = parseInt(
    process.env.QUOTE_V2_ROLLOUT_PERCENTAGE || '0',
    10
  );

  // If rollout is 0, always v1
  if (rolloutPercentage <= 0) return 'v1';

  // If rollout is 100, always v2
  if (rolloutPercentage >= 100) return 'v2';

  // Random assignment based on percentage
  const randomValue = Math.random() * 100;
  return randomValue < rolloutPercentage ? 'v2' : 'v1';
}

/**
 * Get the cookie header to set the quote version
 */
export function getQuoteVersionCookie(version: 'v1' | 'v2'): string {
  return `${COOKIE_NAME}=${version}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get the redirect URL based on version
 */
export function getQuoteUrl(version: 'v1' | 'v2', quoteId?: string): string {
  if (version === 'v2') {
    return quoteId ? `/quote-v2/${quoteId}` : '/quote-v2';
  }
  return quoteId ? `/quote/${quoteId}` : '/quote';
}

/**
 * Check if a path is a quote route
 */
export function isQuoteRoute(pathname: string): boolean {
  return pathname === '/quote' || pathname.startsWith('/quote/');
}

/**
 * Check if a path is a quote-v2 route
 */
export function isQuoteV2Route(pathname: string): boolean {
  return pathname === '/quote-v2' || pathname.startsWith('/quote-v2/');
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
