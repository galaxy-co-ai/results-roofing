/**
 * Server-side Analytics
 * For server-side tracking via sGTM endpoint
 */

import { logger } from '@/lib/utils';

/**
 * GA4 Measurement Protocol configuration
 */
export interface GA4Config {
  measurementId: string;
  apiSecret: string;
}

/**
 * Meta Conversions API (CAPI) configuration
 */
export interface MetaCapiConfig {
  pixelId: string;
  accessToken: string;
}

/**
 * Server-side event payload
 */
export interface ServerEventPayload {
  event: string;
  params: Record<string, unknown>;
  clientTimestamp: number;
  clientId?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Send event to GA4 via Measurement Protocol
 */
export async function sendToGA4(
  config: GA4Config,
  payload: ServerEventPayload
): Promise<boolean> {
  const { measurementId, apiSecret } = config;
  
  if (!measurementId || !apiSecret) {
    logger.warn('GA4 not configured - skipping server-side event');
    return false;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const body = {
    client_id: payload.clientId || 'server',
    user_id: payload.userId,
    timestamp_micros: payload.clientTimestamp * 1000,
    events: [
      {
        name: payload.event,
        params: {
          ...payload.params,
          session_id: payload.params.sessionId,
          engagement_time_msec: 100,
        },
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      logger.warn(`GA4 Measurement Protocol error: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to send event to GA4', error);
    return false;
  }
}

/**
 * Send event to Meta CAPI
 */
export async function sendToMetaCapi(
  config: MetaCapiConfig,
  payload: ServerEventPayload
): Promise<boolean> {
  const { pixelId, accessToken } = config;
  
  if (!pixelId || !accessToken) {
    logger.warn('Meta CAPI not configured - skipping server-side event');
    return false;
  }

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;

  // Map event names to Meta standard events
  const eventNameMap: Record<string, string> = {
    quote_started: 'Lead',
    address_entered: 'InitiateCheckout',
    package_selected: 'AddToCart',
    deposit_paid: 'Purchase',
    page_view: 'PageView',
  };

  const metaEventName = eventNameMap[payload.event] || 'CustomEvent';

  const body = {
    data: [
      {
        event_name: metaEventName,
        event_time: Math.floor(payload.clientTimestamp / 1000),
        action_source: 'website',
        event_source_url: payload.params.pageUrl,
        user_data: {
          client_ip_address: payload.ipAddress,
          client_user_agent: payload.userAgent,
          // Add hashed email/phone if available
        },
        custom_data: {
          ...payload.params,
          original_event_name: payload.event,
        },
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.warn('Meta CAPI error', { error: errorData });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to send event to Meta CAPI', error);
    return false;
  }
}

/**
 * Process server-side event and send to all configured endpoints
 */
export async function processServerEvent(
  payload: ServerEventPayload
): Promise<{ ga4: boolean; meta: boolean }> {
  const ga4Config: GA4Config = {
    measurementId: process.env.GA4_MEASUREMENT_ID || '',
    apiSecret: process.env.GA4_API_SECRET || '',
  };

  const metaConfig: MetaCapiConfig = {
    pixelId: process.env.META_PIXEL_ID || '',
    accessToken: process.env.META_CAPI_ACCESS_TOKEN || '',
  };

  const [ga4Result, metaResult] = await Promise.all([
    sendToGA4(ga4Config, payload),
    sendToMetaCapi(metaConfig, payload),
  ]);

  return {
    ga4: ga4Result,
    meta: metaResult,
  };
}
