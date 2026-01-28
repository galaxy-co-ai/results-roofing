import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import styles from './resume.module.css';

interface ResumeErrorProps {
  title: string;
  message: string;
  showNewQuoteButton?: boolean;
}

/**
 * Error display for resume page issues
 */
export function ResumeError({ title, message, showNewQuoteButton = false }: ResumeErrorProps) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <AlertCircle size={48} className={styles.icon} aria-hidden="true" />
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          {showNewQuoteButton && (
            <Link href="/quote/new" className={styles.primaryButton}>
              Start New Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}

          <Link href="/" className={styles.secondaryButton}>
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
