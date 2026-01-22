import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge content */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * Status badge component
 */
export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  const classes = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

export default Badge;
