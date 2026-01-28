'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './error.module.css';

interface QuoteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Quote Error Page - Displayed when an error occurs in the quote flow
 *
 * This is a Next.js App Router error boundary that catches errors
 * in all /quote/* routes and displays a user-friendly recovery UI.
 */
export default function QuoteError({ error, reset }: QuoteErrorProps) {
  useEffect(() => {
    // Log the error to monitoring service
    // In production, this would send to Sentry or similar
    console.error('[Quote Error]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className={styles.container} role="alert" aria-live="assertive">
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={48} aria-hidden="true" />
        </div>

        <h1 className={styles.title}>Something went wrong</h1>

        <p className={styles.message}>
          We encountered an unexpected error while processing your quote.
          Don&apos;t worry — your progress may be saved.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={reset}
            className={styles.primaryButton}
            aria-label="Try again"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Try Again
          </button>

          <Link href="/quote/new" className={styles.secondaryButton}>
            Start New Quote
          </Link>

          <Link href="/" className={styles.tertiaryButton}>
            <Home size={16} aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        <p className={styles.helpText}>
          If this problem persists, please contact us at{' '}
          <a href="tel:+18005551234" className={styles.helpLink}>
            (800) 555-1234
          </a>
        </p>
      </div>
    </div>
  );
}
