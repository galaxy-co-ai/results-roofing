'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js Error Page
 * Handles runtime errors in the app router
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Page error:', error);
    }
  }, [error]);

  return (
    <main className={styles.container} role="alert" aria-live="assertive">
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>
          We&apos;re sorry, but something unexpected happened. Please try again or contact support if the problem persists.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={reset}
            className={styles.retryButton}
            aria-label="Try again"
          >
            Try Again
          </button>
          <a href="/" className={styles.homeLink}>
            Go to Homepage
          </a>
        </div>
        {process.env.NODE_ENV !== 'production' && error.digest && (
          <p className={styles.errorCode}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
