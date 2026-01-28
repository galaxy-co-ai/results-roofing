'use client';

import { CheckCircle, CreditCard } from 'lucide-react';
import { PaymentForm } from '@/components/features/checkout/PaymentForm';
import { DEPOSIT_CONFIG } from '@/lib/constants';
import styles from './Stage3.module.css';

interface PaymentSectionProps {
  quoteId: string;
  depositAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  isEnabled: boolean;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Stage 3, Section 4: Payment
 * 
 * Stripe payment form for deposit.
 */
export function PaymentSection({
  quoteId,
  depositAmount,
  onSuccess,
  onError,
  isEnabled,
}: PaymentSectionProps) {
  const depositPercent = DEPOSIT_CONFIG.percentage * 100;

  // Show disabled state
  if (!isEnabled) {
    return (
      <section className={`${styles.section} ${styles.section_disabled}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber_disabled}>4</div>
          <div className={styles.sectionHeaderText}>
            <h2 className={styles.sectionTitle_disabled}>Payment</h2>
            <p className={styles.sectionSubtitle_disabled}>
              Sign contract to continue
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>4</div>
        <div className={styles.sectionHeaderText}>
          <h2 className={styles.sectionTitle}>Payment</h2>
          <p className={styles.sectionSubtitle}>
            Pay your {depositPercent}% deposit to secure your installation date
          </p>
        </div>
      </div>

      {/* Payment summary */}
      <div className={styles.paymentSummary}>
        <div className={styles.paymentRow}>
          <span className={styles.paymentLabel}>
            <CreditCard size={16} aria-hidden="true" />
            Deposit Amount ({depositPercent}%)
          </span>
          <span className={styles.paymentAmount}>{formatPrice(depositAmount)}</span>
        </div>
        <p className={styles.paymentNote}>
          Balance due upon completion of installation
        </p>
      </div>

      {/* Payment form */}
      <div className={styles.paymentFormWrapper}>
        <PaymentForm
          quoteId={quoteId}
          depositAmount={depositAmount}
          onSuccess={onSuccess}
          onError={onError}
          redirectOnSuccess={false}
        />
      </div>
    </section>
  );
}

export default PaymentSection;
