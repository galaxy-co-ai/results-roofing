/**
 * GAF QuickMeasure (Digital Design) API Adapter
 *
 * Async satellite roof measurement service via GAF's partner API.
 * Flow: Place Order -> ~1hr -> Webhook callback with measurements + reports
 *
 * Docs: GAF Digital Design Partner API (ZPR)
 * Auth: Okta OAuth2 client_credentials
 */

import { getGAFToken } from '@/lib/gaf/auth';
import { logger } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface GAFPlaceOrderInput {
  quoteId: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  fullAddress: string;
}

export interface GAFOrderResponse {
  OrderNumber?: number;
  orderId?: string;
  Status?: string;
  Message?: string;
  [key: string]: unknown;
}

export interface GAFCoverageResponse {
  IsCovered: boolean;
  Message?: string;
  [key: string]: unknown;
}

export interface GAFSearchResponse {
  OrderNumber?: number;
  Status?: string;
  RoofMeasurement?: GAFRoofMeasurement;
  [key: string]: unknown;
}

export interface GAFRoofMeasurement {
  TotalArea?: number;
  PredominantPitch?: string;
  RidgeLength?: number;
  HipLength?: number;
  ValleyLength?: number;
  EaveRakeLength?: number;
  [key: string]: unknown;
}

// ============================================================
// Adapter
// ============================================================

const GAF_API_URL = process.env.GAF_API_URL;

async function gafFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getGAFToken();
  const url = `${GAF_API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');
    throw new Error(`GAF API error (${res.status}) ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const gafAdapter = {
  /**
   * Check if GAF integration is configured (all required env vars present)
   */
  isConfigured(): boolean {
    return !!(
      process.env.GAF_CLIENT_ID &&
      process.env.GAF_CLIENT_SECRET &&
      process.env.GAF_OKTA_TOKEN_URL &&
      process.env.GAF_API_URL &&
      process.env.GAF_SUBSCRIBER_NAME &&
      process.env.GAF_PRODUCT_CODE
    );
  },

  /**
   * Check if a location is within GAF's coverage area
   */
  async checkCoverage(
    lat: number,
    lng: number
  ): Promise<GAFCoverageResponse> {
    return gafFetch<GAFCoverageResponse>(
      `/coverageCheck?latitude=${lat}&longitude=${lng}`
    );
  },

  /**
   * Place a QuickMeasure order with GAF
   *
   * Returns immediately with an order number.
   * Results arrive ~1hr later via webhook callback.
   */
  async placeOrder(input: GAFPlaceOrderInput): Promise<GAFOrderResponse> {
    const subscriberOrderNumber = `RR-${input.quoteId}`;

    const payload = {
      subscriberName: process.env.GAF_SUBSCRIBER_NAME,
      subscriberOrderNumber,
      subscriberCustomField1: input.quoteId,
      emailAddress: process.env.GAF_SUBSCRIBER_EMAIL,
      productCode: process.env.GAF_PRODUCT_CODE,
      address1: input.address1,
      address2: input.address2 || '',
      city: input.city,
      state: input.state,
      zip: input.zip,
      latitude: input.lat,
      longitude: input.lng,
      fullAddress: input.fullAddress,
      ignoreCache: true,
      checkForDuplicate: false,
    };

    logger.info('[GAF] Placing QuickMeasure order', {
      subscriberOrderNumber,
      address: input.fullAddress,
    });

    const result = await gafFetch<GAFOrderResponse>('/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    logger.info('[GAF] Order placed', {
      subscriberOrderNumber,
      gafOrderNumber: result.OrderNumber,
      status: result.Status,
    });

    return result;
  },

  /**
   * Download a report/asset file from GAF
   * Returns the raw Buffer for storage in Vercel Blob
   */
  async downloadAsset(filename: string): Promise<Buffer> {
    const token = await getGAFToken();
    const url = `${GAF_API_URL}/download/${filename}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream',
      },
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      throw new Error(`GAF download failed (${res.status}): ${filename}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },

  /**
   * Search for an order by its GAF order number
   */
  async searchOrder(orderId: string): Promise<GAFSearchResponse> {
    return gafFetch<GAFSearchResponse>(
      `/orderSearch?orderNumber=${encodeURIComponent(orderId)}`
    );
  },
};
