/**
 * Core Analytics Tracker
 * Main tracking functions for analytics events
 */

import type { AnalyticsEventName, EventParamsMap, BaseEventParams } from './events';
import { pushToDataLayer, pushPageView, isBrowser } from './gtm';
import { hasAnalyticsConsent } from './consent';

/**
 * Configuration for the tracker
 */
export interface TrackerConfig {
  /** Whether to require consent before tracking */
  requireConsent: boolean;
  /** Whether to log events to console in development */
  debug: boolean;
  /** Server-side tracking endpoint */
  serverEndpoint?: string;
}

const defaultConfig: TrackerConfig = {
  requireConsent: true,
  debug: process.env.NODE_ENV === 'development',
  serverEndpoint: '/api/analytics/collect',
};

let trackerConfig = { ...defaultConfig };

/**
 * Initialize the tracker with custom configuration
 */
export function initTracker(config: Partial<TrackerConfig>): void {
  trackerConfig = { ...defaultConfig, ...config };
}

/**
 * Check if tracking is allowed
 */
function canTrack(): boolean {
  if (!trackerConfig.requireConsent) return true;
  return hasAnalyticsConsent();
}

/**
 * Generate a unique session ID
 */
export function getSessionId(): string {
  if (!isBrowser()) return '';

  const SESSION_KEY = 'rr_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Track an analytics event
 */
export function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  params: T extends keyof EventParamsMap ? EventParamsMap[T] : BaseEventParams
): void {
  if (!canTrack()) {
    // Tracking blocked due to missing consent
    return;
  }

  const enrichedParams = {
    ...params,
    sessionId: getSessionId(),
    pageUrl: isBrowser() ? window.location.href : undefined,
    timestamp: Date.now(),
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventName, enrichedParams);

  // Also send to server for sGTM
  if (trackerConfig.serverEndpoint) {
    sendToServer(eventName, enrichedParams as unknown as Record<string, unknown>).catch(() => {
      // Silent failure for server-side tracking
    });
  }
}

/**
 * Track a page view
 */
export function trackPageView(options?: {
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
}): void {
  if (!canTrack()) return;

  const params = {
    pagePath: options?.pagePath || (isBrowser() ? window.location.pathname : ''),
    pageTitle: options?.pageTitle || (isBrowser() ? document.title : ''),
    referrer: options?.referrer || (isBrowser() ? document.referrer : ''),
  };

  pushPageView(params);

  // Also send to server
  if (trackerConfig.serverEndpoint) {
    sendToServer('page_view', {
      ...params,
      sessionId: getSessionId(),
      pageUrl: isBrowser() ? window.location.href : undefined,
      timestamp: Date.now(),
    }).catch(() => {
      // Silent failure
    });
  }
}

/**
 * Track a conversion event (deposit paid)
 */
export function trackConversion(params: {
  quoteId: string;
  orderId: string;
  confirmationNumber: string;
  depositAmount: number;
  totalPrice: number;
  tier: 'good' | 'better' | 'best';
}): void {
  trackEvent('deposit_paid', {
    ...params,
    value: params.depositAmount,
    currency: 'USD',
    sessionId: getSessionId(),
    timestamp: Date.now(),
  });
}

/**
 * Track quote funnel progression
 */
export const funnelTracker = {
  quoteStarted(params: { source?: string; utmCampaign?: string; utmSource?: string; utmMedium?: string }) {
    trackEvent('quote_started', params);
  },

  addressEntered(params: { quoteId: string; state: string; city: string }) {
    trackEvent('address_entered', params);
  },

  measurementRequested(params: { quoteId: string }) {
    trackEvent('measurement_requested', params);
  },

  measurementCompleted(params: { quoteId: string; durationMs?: number; source?: 'roofr' | 'manual' }) {
    trackEvent('measurement_completed', params);
  },

  measurementTimeout(params: { quoteId: string; durationMs?: number }) {
    trackEvent('measurement_timeout', params);
  },

  packageSelected(params: { quoteId: string; tier: 'good' | 'better' | 'best'; totalPrice: number; depositAmount: number; sqft?: number }) {
    trackEvent('package_selected', params);
  },

  financingStarted(params: { quoteId: string }) {
    trackEvent('financing_started', params);
  },

  financingCompleted(params: { quoteId: string; provider?: 'wisetack' | 'hearth'; termMonths?: number; monthlyPayment?: number }) {
    trackEvent('financing_completed', params);
  },

  appointmentBooked(params: { quoteId: string; appointmentDate: string; appointmentType?: 'installation' | 'inspection' }) {
    trackEvent('appointment_booked', params);
  },

  contractSigned(params: { quoteId: string; contractId: string }) {
    trackEvent('contract_signed', params);
  },

  depositPaid: trackConversion,
};

/**
 * Send event to server-side endpoint
 */
async function sendToServer(eventName: string, params: Record<string, unknown>): Promise<void> {
  if (!trackerConfig.serverEndpoint) return;

  try {
    const response = await fetch(trackerConfig.serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        params,
        clientTimestamp: Date.now(),
      }),
      // Don't wait for analytics to block user actions
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`Analytics server error: ${response.status}`);
    }
  } catch {
    // Silent failure for non-critical analytics
  }
}
