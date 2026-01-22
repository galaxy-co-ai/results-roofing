/**
 * Simple in-memory rate limiting utility
 * For production, replace with Redis-based rate limiting (Upstash)
 * 
 * @example
 * ```ts
 * const limiter = createRateLimiter({ 
 *   windowMs: 60_000,  // 1 minute
 *   maxRequests: 10    // 10 requests per minute
 * });
 * 
 * // In API route
 * const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
 * const { success, remaining, resetAt } = limiter.check(identifier);
 * 
 * if (!success) {
 *   return new Response('Too Many Requests', { 
 *     status: 429,
 *     headers: {
 *       'X-RateLimit-Remaining': '0',
 *       'X-RateLimit-Reset': resetAt.toISOString(),
 *     }
 *   });
 * }
 * ```
 */

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** When the rate limit resets */
  resetAt: Date;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Creates a rate limiter instance
 * Uses in-memory storage (not suitable for serverless without external state)
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;
  const store = new Map<string, RateLimitEntry>();

  // Cleanup old entries periodically
  const cleanup = () => {
    const now = Date.now();
    const entries = Array.from(store.entries());
    for (const [key, entry] of entries) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  };

  // Run cleanup every minute
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, 60_000);
  }

  return {
    /**
     * Check if a request should be allowed
     * @param identifier - Unique identifier (IP, user ID, etc.)
     */
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier);

      // First request or window expired
      if (!entry || entry.resetAt < now) {
        const resetAt = now + windowMs;
        store.set(identifier, { count: 1, resetAt });
        return {
          success: true,
          remaining: maxRequests - 1,
          resetAt: new Date(resetAt),
        };
      }

      // Within window, check count
      if (entry.count >= maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetAt: new Date(entry.resetAt),
        };
      }

      // Increment and allow
      entry.count++;
      return {
        success: true,
        remaining: maxRequests - entry.count,
        resetAt: new Date(entry.resetAt),
      };
    },

    /**
     * Reset rate limit for an identifier
     */
    reset(identifier: string): void {
      store.delete(identifier);
    },

    /**
     * Get current state for an identifier
     */
    get(identifier: string): RateLimitResult | null {
      const entry = store.get(identifier);
      if (!entry) return null;
      
      const now = Date.now();
      if (entry.resetAt < now) {
        store.delete(identifier);
        return null;
      }

      return {
        success: entry.count < maxRequests,
        remaining: Math.max(0, maxRequests - entry.count),
        resetAt: new Date(entry.resetAt),
      };
    },
  };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /** Quote creation: 10 per minute per IP */
  quoteCreation: createRateLimiter({ windowMs: 60_000, maxRequests: 10 }),
  
  /** API general: 100 per minute per IP */
  apiGeneral: createRateLimiter({ windowMs: 60_000, maxRequests: 100 }),
  
  /** Webhook (no limit, but track for monitoring) */
  webhook: createRateLimiter({ windowMs: 60_000, maxRequests: 1000 }),
};

/**
 * Helper to get identifier from request
 */
export function getRequestIdentifier(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  );
}

/**
 * Helper to create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

export type { RateLimitConfig, RateLimitResult };
