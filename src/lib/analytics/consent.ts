/**
 * Analytics Consent Management
 * Manages user consent for analytics tracking
 */

import { isBrowser } from './gtm';

/**
 * Consent categories
 */
export type ConsentCategory = 
  | 'analytics'
  | 'marketing'
  | 'functional'
  | 'necessary';

/**
 * Consent state
 */
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean; // Always true
}

/**
 * Default consent state (conservative - analytics/marketing off)
 */
const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  marketing: false,
  functional: true,
  necessary: true,
};

const CONSENT_STORAGE_KEY = 'rr_analytics_consent';

/**
 * Get current consent state from storage
 */
export function getConsentState(): ConsentState {
  if (!isBrowser()) {
    return DEFAULT_CONSENT;
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_CONSENT,
        ...parsed,
        necessary: true, // Always true
      };
    }
  } catch {
    // Invalid storage, use defaults
  }

  return DEFAULT_CONSENT;
}

/**
 * Set consent state
 */
export function setConsentState(consent: Partial<ConsentState>): void {
  if (!isBrowser()) return;

  const currentConsent = getConsentState();
  const newConsent: ConsentState = {
    ...currentConsent,
    ...consent,
    necessary: true, // Always true
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
    
    // Update GTM consent mode if available
    updateGTMConsent(newConsent);
  } catch {
    // Storage not available
  }
}

/**
 * Grant all consent
 */
export function grantAllConsent(): void {
  setConsentState({
    analytics: true,
    marketing: true,
    functional: true,
  });
}

/**
 * Deny optional consent (keep necessary only)
 */
export function denyOptionalConsent(): void {
  setConsentState({
    analytics: false,
    marketing: false,
    functional: true,
  });
}

/**
 * Check if a specific consent category is granted
 */
export function hasConsent(category: ConsentCategory): boolean {
  const state = getConsentState();
  return state[category] ?? false;
}

/**
 * Check if analytics consent has been given
 */
export function hasAnalyticsConsent(): boolean {
  return hasConsent('analytics');
}

/**
 * Check if marketing consent has been given
 */
export function hasMarketingConsent(): boolean {
  return hasConsent('marketing');
}

/**
 * Update Google Consent Mode v2
 */
function updateGTMConsent(consent: ConsentState): void {
  if (!isBrowser() || !window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.functional ? 'granted' : 'denied',
    security_storage: 'granted', // Always needed
  });
}

/**
 * Initialize consent mode with default denied state
 * Call this before GTM loads
 */
export function initConsentMode(): void {
  if (!isBrowser()) return;

  // Ensure gtag is available
  window.gtag = window.gtag || function(...args: unknown[]) {
    window.dataLayer = window.dataLayer || [];
    // Push as a special gtag command object
    window.dataLayer.push({ event: 'gtag.command', arguments: args });
  };

  // Set default consent (denied until user accepts)
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500, // Wait for consent update
  });

  // Apply stored consent if available
  const storedConsent = getConsentState();
  if (storedConsent.analytics || storedConsent.marketing) {
    updateGTMConsent(storedConsent);
  }
}
