/**
 * Analytics Module
 * Central export for all analytics functionality
 */

// Event definitions and types
export * from './events';

// GTM/dataLayer utilities
export { 
  getDataLayer, 
  pushToDataLayer, 
  pushPageView, 
  pushConversion,
  initGTM,
  isBrowser,
} from './gtm';

// Consent management
export {
  getConsentState,
  setConsentState,
  grantAllConsent,
  denyOptionalConsent,
  hasConsent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  initConsentMode,
  type ConsentState,
  type ConsentCategory,
} from './consent';

// Core tracking
export {
  initTracker,
  trackEvent,
  trackPageView,
  trackConversion,
  funnelTracker,
  getSessionId,
  type TrackerConfig,
} from './tracker';

// Server-side tracking
export {
  sendToGA4,
  sendToMetaCapi,
  processServerEvent,
  type GA4Config,
  type MetaCapiConfig,
  type ServerEventPayload,
} from './server';
