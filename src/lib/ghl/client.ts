/**
 * GoHighLevel API Client
 * Base URL: https://services.leadconnectorhq.com/
 * API Docs: https://highlevel.stoplight.io/
 *
 * Rate Limits:
 * - 100 requests per 10 seconds (burst)
 * - 200,000 requests per day
 */

import { createRateLimiter } from '@/lib/api/rate-limit';

// GHL-specific rate limiter: 100 requests per 10 seconds
const ghlRateLimiter = createRateLimiter({
  windowMs: 10_000,
  maxRequests: 100,
});

export interface GHLClientConfig {
  apiKey: string;
  locationId: string;
  baseUrl?: string;
}

export interface GHLRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  skipRateLimit?: boolean;
}

export interface GHLResponse<T> {
  data: T;
  meta?: {
    total?: number;
    startAfterId?: string;
    startAfter?: number;
  };
}

export interface GHLError {
  statusCode: number;
  message: string;
  error?: string;
}

class GHLClientError extends Error {
  statusCode: number;
  originalError?: unknown;

  constructor(message: string, statusCode: number, originalError?: unknown) {
    super(message);
    this.name = 'GHLClientError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Creates a GoHighLevel API client instance
 */
export function createGHLClient(config: GHLClientConfig) {
  const { apiKey, locationId, baseUrl = 'https://services.leadconnectorhq.com' } = config;

  if (!apiKey) {
    throw new Error('GHL API key is required');
  }

  if (!locationId) {
    throw new Error('GHL Location ID is required');
  }

  /**
   * Make an authenticated request to the GHL API
   */
  async function request<T>(
    endpoint: string,
    options: GHLRequestOptions = {}
  ): Promise<GHLResponse<T>> {
    const { method = 'GET', body, params, skipRateLimit = false } = options;

    // Check rate limit
    if (!skipRateLimit) {
      const rateLimitResult = ghlRateLimiter.check('ghl-api');
      if (!rateLimitResult.success) {
        throw new GHLClientError(
          `Rate limit exceeded. Reset at ${rateLimitResult.resetAt.toISOString()}`,
          429
        );
      }
    }

    // Build URL with query params
    const url = new URL(endpoint, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    // Make request
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28', // GHL API version
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle errors
    if (!response.ok) {
      let errorMessage = `GHL API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json() as GHLError;
        errorMessage = errorBody.message || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
      throw new GHLClientError(errorMessage, response.status);
    }

    // Parse response and wrap in expected structure
    const data = await response.json();
    return { data } as GHLResponse<T>;
  }

  return {
    /**
     * Get the location ID
     */
    getLocationId: () => locationId,

    /**
     * Make a GET request
     */
    get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'GET', params }),

    /**
     * Make a POST request
     */
    post: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'POST', body, params }),

    /**
     * Make a PUT request
     */
    put: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'PUT', body, params }),

    /**
     * Make a PATCH request
     */
    patch: <T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'PATCH', body, params }),

    /**
     * Make a DELETE request
     */
    delete: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'DELETE', params }),

    /**
     * Raw request method for custom needs
     */
    request,

    /**
     * Check rate limit status
     */
    getRateLimitStatus: () => ghlRateLimiter.get('ghl-api'),
  };
}

/**
 * Get the default GHL client using environment variables
 */
export function getGHLClient() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    throw new Error('GHL_API_KEY and GHL_LOCATION_ID environment variables are required');
  }

  return createGHLClient({ apiKey, locationId });
}

export { GHLClientError, ghlRateLimiter };
