import Link from 'next/link';
import { Badge } from '@/components/ui';
import styles from './QuickActionCard.module.css';

interface QuickActionCardProps {
  /** Action icon */
  icon: React.ReactNode;
  /** Action label */
  label: string;
  /** Optional description */
  description?: string;
  /** Navigation target */
  href: string;
  /** Badge text (e.g., "3 new") */
  badge?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Portal quick action card
 * Shortcut navigation for common portal actions
 */
export function QuickActionCard({
  icon,
  label,
  description,
  href,
  badge,
  disabled = false,
  className = '',
}: QuickActionCardProps) {
  const cardClass = [
    styles.card,
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className={styles.iconWrapper} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </div>
      {badge && (
        <Badge variant="primary" size="sm" className={styles.badge}>
          {badge}
        </Badge>
      )}
    </>
  );

  if (disabled) {
    return (
      <div className={cardClass} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={cardClass}>
      {content}
    </Link>
  );
}

export default QuickActionCard;
