import { Check } from 'lucide-react';
import styles from './BenefitPills.module.css';

interface BenefitPill {
  label: string;
}

interface BenefitPillsProps {
  pills?: BenefitPill[];
  className?: string;
}

const DEFAULT_PILLS: BenefitPill[] = [
  { label: 'Fully Refundable' },
  { label: 'Secures Your Date' },
  { label: '3-Day Cancellation' },
];

/**
 * BenefitPills - Displays key benefits as pill-style badges
 * Used in the deposit page hero to highlight value propositions
 */
export function BenefitPills({ pills = DEFAULT_PILLS, className = '' }: BenefitPillsProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {pills.map((pill, index) => (
        <span key={index} className={styles.pill}>
          <Check size={14} className={styles.icon} aria-hidden="true" />
          <span>{pill.label}</span>
        </span>
      ))}
    </div>
  );
}

export default BenefitPills;
