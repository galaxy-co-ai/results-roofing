/**
 * Google Tag Manager / dataLayer Utilities
 * Manages the dataLayer and GTM integration
 */

import type { AnalyticsEventName, EventParamsMap, BaseEventParams } from './events';

/**
 * DataLayer item structure for GTM
 */
export interface DataLayerItem {
  event: string;
  [key: string]: unknown;
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get or initialize the dataLayer
 */
export function getDataLayer(): DataLayerItem[] {
  if (!isBrowser()) return [];
  
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  return window.dataLayer;
}

/**
 * Push an event to the dataLayer
 */
export function pushToDataLayer<T extends AnalyticsEventName>(
  eventName: T,
  params: T extends keyof EventParamsMap ? EventParamsMap[T] : BaseEventParams
): void {
  if (!isBrowser()) return;

  const dataLayer = getDataLayer();
  
  const event: DataLayerItem = {
    event: eventName,
    ...params,
    timestamp: params.timestamp || Date.now(),
  };

  dataLayer.push(event);

  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', eventName, params);
  }
}

/**
 * Push a page view to the dataLayer
 */
export function pushPageView(params: {
  pagePath: string;
  pageTitle: string;
  referrer?: string;
}): void {
  pushToDataLayer('page_view', {
    pagePath: params.pagePath,
    pageTitle: params.pageTitle,
    referrer: params.referrer,
    pageUrl: isBrowser() ? window.location.href : undefined,
    timestamp: Date.now(),
  });
}

/**
 * Push e-commerce conversion event
 */
export function pushConversion(params: {
  quoteId: string;
  orderId: string;
  confirmationNumber: string;
  depositAmount: number;
  totalPrice: number;
  tier: 'good' | 'better' | 'best';
}): void {
  pushToDataLayer('deposit_paid', {
    ...params,
    value: params.depositAmount,
    currency: 'USD',
    timestamp: Date.now(),
  });
}

/**
 * Initialize GTM with the container ID
 * This should be called once in the app layout
 */
export function initGTM(containerId: string): void {
  if (!isBrowser() || !containerId) return;

  // Check if GTM is already loaded
  if (window.google_tag_manager?.[containerId]) {
    return;
  }

  // Initialize dataLayer
  getDataLayer();

  // Push initial gtm.start event
  window.dataLayer?.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  // Create and inject GTM script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
}

/**
 * Declare window types for GTM
 */
declare global {
  interface Window {
    dataLayer?: DataLayerItem[];
    google_tag_manager?: Record<string, unknown>;
    gtag?: (...args: unknown[]) => void;
  }
}
