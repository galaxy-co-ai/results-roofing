'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  initGTM,
  initConsentMode,
  initTracker,
  trackPageView,
} from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
  /** Google Tag Manager container ID */
  gtmId?: string;
  /** Whether analytics consent is required before tracking */
  requireConsent?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * AnalyticsProvider
 * Initializes analytics tracking and GTM
 * 
 * Usage:
 * ```tsx
 * <AnalyticsProvider gtmId={process.env.NEXT_PUBLIC_GTM_ID}>
 *   {children}
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({
  children,
  gtmId,
  requireConsent = true,
  debug = process.env.NODE_ENV === 'development',
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize consent mode and tracker on mount
  useEffect(() => {
    // Initialize consent mode first (before GTM loads)
    initConsentMode();

    // Initialize the tracker
    initTracker({
      requireConsent,
      debug,
      serverEndpoint: '/api/analytics/collect',
    });

    // Initialize GTM if container ID provided
    if (gtmId) {
      initGTM(gtmId);
    }
  }, [gtmId, requireConsent, debug]);

  // Track page views on route changes
  useEffect(() => {
    trackPageView({
      pagePath: pathname,
      pageTitle: typeof document !== 'undefined' ? document.title : '',
    });
  }, [pathname, searchParams]);

  return (
    <>
      {/* GTM noscript fallback */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}
      {children}
    </>
  );
}

export default AnalyticsProvider;
