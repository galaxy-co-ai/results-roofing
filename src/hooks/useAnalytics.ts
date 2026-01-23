'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  trackEvent,
  trackPageView,
  funnelTracker,
  type AnalyticsEventName,
  type EventParamsMap,
  type BaseEventParams,
} from '@/lib/analytics';

/**
 * Hook for tracking page views
 * Automatically tracks page views on route changes
 */
export function useTrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only track if pathname changed (not just search params)
    if (pathname !== prevPathname.current) {
      trackPageView({
        pagePath: pathname,
        pageTitle: document.title,
      });
      prevPathname.current = pathname;
    }
  }, [pathname, searchParams]);
}

/**
 * Hook for tracking custom events
 * Returns a memoized track function
 */
export function useTrackEvent() {
  const track = useCallback(
    <T extends AnalyticsEventName>(
      eventName: T,
      params: T extends keyof EventParamsMap ? EventParamsMap[T] : BaseEventParams
    ) => {
      trackEvent(eventName, params);
    },
    []
  );

  return track;
}

/**
 * Hook for tracking quote funnel events
 * Returns memoized funnel tracking functions
 */
export function useFunnelTracker() {
  const tracker = {
    quoteStarted: useCallback(funnelTracker.quoteStarted, []),
    addressEntered: useCallback(funnelTracker.addressEntered, []),
    measurementRequested: useCallback(funnelTracker.measurementRequested, []),
    measurementCompleted: useCallback(funnelTracker.measurementCompleted, []),
    measurementTimeout: useCallback(funnelTracker.measurementTimeout, []),
    packageSelected: useCallback(funnelTracker.packageSelected, []),
    financingStarted: useCallback(funnelTracker.financingStarted, []),
    financingCompleted: useCallback(funnelTracker.financingCompleted, []),
    appointmentBooked: useCallback(funnelTracker.appointmentBooked, []),
    contractSigned: useCallback(funnelTracker.contractSigned, []),
    depositPaid: useCallback(funnelTracker.depositPaid, []),
  };

  return tracker;
}

/**
 * Hook for tracking conversion events
 */
export function useTrackConversion() {
  const trackConversion = useCallback(
    (params: {
      quoteId: string;
      orderId: string;
      confirmationNumber: string;
      depositAmount: number;
      totalPrice: number;
      tier: 'good' | 'better' | 'best';
    }) => {
      funnelTracker.depositPaid(params);
    },
    []
  );

  return trackConversion;
}

/**
 * Hook for tracking clicks on CTA buttons
 */
export function useTrackCta() {
  const track = useCallback(
    (params: {
      ctaId: string;
      ctaText: string;
      ctaLocation: string;
    }) => {
      trackEvent('cta_clicked', params);
    },
    []
  );

  return track;
}

/**
 * Hook for tracking form interactions
 */
export function useTrackForm(formId: string) {
  const hasStarted = useRef(false);

  const trackFormStart = useCallback(() => {
    if (!hasStarted.current) {
      trackEvent('form_started', { formId });
      hasStarted.current = true;
    }
  }, [formId]);

  const trackFormComplete = useCallback(() => {
    trackEvent('form_completed', { formId });
    hasStarted.current = false;
  }, [formId]);

  return {
    trackFormStart,
    trackFormComplete,
  };
}

/**
 * Hook for tracking errors
 */
export function useTrackError() {
  const track = useCallback(
    (params: {
      errorType: string;
      errorMessage: string;
      errorStack?: string;
      componentName?: string;
    }) => {
      trackEvent('error_occurred', params);
    },
    []
  );

  return track;
}
