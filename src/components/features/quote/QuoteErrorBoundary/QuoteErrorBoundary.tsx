'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './QuoteErrorBoundary.module.css';

interface QuoteErrorBoundaryProps {
  children: ReactNode;
  quoteId?: string;
}

interface QuoteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * QuoteErrorBoundary - Catches errors in quote flow pages
 *
 * Displays a user-friendly error message with recovery options:
 * - Retry the current page
 * - Start a new quote
 * - Go back home
 *
 * Logs technical details for debugging but shows friendly message to users.
 */
export class QuoteErrorBoundary extends Component<
  QuoteErrorBoundaryProps,
  QuoteErrorBoundaryState
> {
  constructor(props: QuoteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): QuoteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to error monitoring service (e.g., Sentry)
    // In production, this would send to a logging service
    // For now, we use the logger utility pattern from the project
    if (typeof window !== 'undefined') {
      // Client-side logging
      console.error('[QuoteErrorBoundary] Error caught:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        quoteId: this.props.quoteId,
      });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    // Force a re-render by triggering a page reload
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
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
                onClick={this.handleRetry}
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

    return this.props.children;
  }
}

export default QuoteErrorBoundary;
