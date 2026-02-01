import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay - capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV,

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Network errors users can't control
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // User aborted requests
    'AbortError',
    // Resize observer - benign
    'ResizeObserver loop',
  ],

  // Add integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media for privacy
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Customize before sending
  beforeSend(event) {
    // Don't send events in development unless DSN is explicitly set
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }
    return event;
  },
});
