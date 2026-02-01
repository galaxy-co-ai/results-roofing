'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            backgroundColor: '#f9fafb',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
              }}
            >
              We&apos;ve been notified and are working to fix the issue.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
