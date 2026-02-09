import { Shield, Award, Star } from 'lucide-react';
import styles from './TrustBar.module.css';

interface TrustBarProps {
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * TrustBar - Displays company credentials and trust signals
 * 
 * F19: Trust & Credentials Display
 * Shows license info, ratings, and certifications in a clean, understated format
 */
export function TrustBar({ variant = 'light', className = '' }: TrustBarProps) {
  return (
    <section 
      className={`${styles.trustBar} ${styles[`trustBar_${variant}`]} ${className}`}
      aria-label="Trust and credentials"
    >
      <div className={styles.container}>
        <div className={styles.item}>
          <Shield size={16} className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>Licensed & Insured</span>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.item}>
          <Award size={16} className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>GAF Certified Contractor</span>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.item}>
          <Star size={16} className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>4.9 Rating</span>
          <span className={styles.subtext}>(200+ reviews)</span>
        </div>
      </div>
    </section>
  );
}

export default TrustBar;
