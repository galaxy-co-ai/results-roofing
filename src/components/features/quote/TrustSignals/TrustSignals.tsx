'use client';

import { Shield, Award, Star, Lock, Users } from 'lucide-react';
import styles from './TrustSignals.module.css';

type TrustSignalsVariant = 'compact' | 'full';

interface TrustSignalsProps {
  variant?: TrustSignalsVariant;
  showCounter?: boolean;
  className?: string;
}

const HOMEOWNER_COUNT = '2,847';

/**
 * TrustSignals - Enhanced trust and social proof display
 *
 * Compact: Single-line with optional homeowner counter
 * Full: Card with all credentials and social proof
 */
export function TrustSignals({
  variant = 'compact',
  showCounter = false,
  className = '',
}: TrustSignalsProps) {
  if (variant === 'compact') {
    return (
      <div className={`${styles.compact} ${className}`}>
        {showCounter && (
          <>
            <div className={styles.compactItem}>
              <Users size={14} className={styles.compactIcon} aria-hidden="true" />
              <span>{HOMEOWNER_COUNT} homeowners quoted this month</span>
            </div>
            <div className={styles.compactDivider} aria-hidden="true" />
          </>
        )}
        <div className={styles.compactItem}>
          <Lock size={14} className={styles.compactIconSecure} aria-hidden="true" />
          <span>256-bit SSL</span>
        </div>
        <div className={styles.compactDivider} aria-hidden="true" />
        <div className={styles.compactItem}>
          <Shield size={14} className={styles.compactIcon} aria-hidden="true" />
          <span>Licensed & Insured</span>
        </div>
      </div>
    );
  }

  return (
    <section className={`${styles.full} ${className}`} aria-label="Trust and credentials">
      <div className={styles.fullGrid}>
        {/* Social proof */}
        <div className={styles.fullItem}>
          <div className={styles.fullIconWrapper}>
            <Users size={20} className={styles.fullIconPrimary} aria-hidden="true" />
          </div>
          <div className={styles.fullContent}>
            <span className={styles.fullValue}>{HOMEOWNER_COUNT}</span>
            <span className={styles.fullLabel}>Quotes this month</span>
          </div>
        </div>

        {/* Security */}
        <div className={styles.fullItem}>
          <div className={styles.fullIconWrapperSecure}>
            <Lock size={20} className={styles.fullIconSecure} aria-hidden="true" />
          </div>
          <div className={styles.fullContent}>
            <span className={styles.fullValue}>SSL Encrypted</span>
            <span className={styles.fullLabel}>256-bit security</span>
          </div>
        </div>

        {/* Licensed & Insured */}
        <div className={styles.fullItem}>
          <div className={styles.fullIconWrapper}>
            <Shield size={20} className={styles.fullIconPrimary} aria-hidden="true" />
          </div>
          <div className={styles.fullContent}>
            <span className={styles.fullValue}>Licensed</span>
            <span className={styles.fullLabel}>Fully insured</span>
          </div>
        </div>

        {/* Rating */}
        <div className={styles.fullItem}>
          <div className={styles.fullIconWrapperRating}>
            <Star size={20} className={styles.fullIconRating} aria-hidden="true" />
          </div>
          <div className={styles.fullContent}>
            <span className={styles.fullValue}>4.9 Rating</span>
            <span className={styles.fullLabel}>200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustSignals;
