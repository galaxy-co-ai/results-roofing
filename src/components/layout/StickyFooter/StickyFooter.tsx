'use client';

import type { ReactNode } from 'react';
import styles from './StickyFooter.module.css';

interface StickyFooterProps {
  /** Footer content (typically CTA button) */
  children: ReactNode;
  /** Show on all screen sizes (default: mobile only) */
  alwaysVisible?: boolean;
  /** Show summary above CTA */
  summary?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * Sticky footer for mobile CTAs
 * Fixed at bottom of viewport with safe area padding
 */
export function StickyFooter({
  children,
  alwaysVisible = false,
  summary,
  className = '',
}: StickyFooterProps) {
  const classes = [
    styles.stickyFooter,
    alwaysVisible ? styles.alwaysVisible : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="complementary" aria-label="Actions">
      {summary && <div className={styles.summary}>{summary}</div>}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

export default StickyFooter;
