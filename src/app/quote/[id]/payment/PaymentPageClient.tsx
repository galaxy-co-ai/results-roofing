'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { PaymentForm } from '@/components/features/checkout';
import { InlineConfirmation } from '@/components/features/payment/InlineConfirmation';
import styles from './page.module.css';

interface PaymentPageClientProps {
  quoteId: string;
  totalPrice: number;
  depositAmount: number;
  tierName: string;
  scheduledDate: string | null;
  scheduledTimeSlot: 'morning' | 'afternoon' | null;
  customerEmail: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateConfirmationNumber(): string {
  const prefix = 'RR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function PaymentPageClient({
  quoteId,
  totalPrice,
  depositAmount,
  tierName,
  scheduledDate,
  scheduledTimeSlot,
  customerEmail,
}: PaymentPageClientProps) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmationNumber] = useState(() => generateConfirmationNumber());

  const handlePaymentSuccess = useCallback(() => {
    setPaymentSuccess(true);
  }, []);

  // Show inline confirmation on success
  if (paymentSuccess) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <InlineConfirmation
            confirmationNumber={confirmationNumber}
            scheduledDate={scheduledDate ? new Date(scheduledDate) : null}
            timeSlot={scheduledTimeSlot}
            customerEmail={customerEmail || undefined}
            portalUrl={`/portal/${quoteId}`}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/contract`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Back to Contract
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <CreditCard size={32} />
          </div>
          <h1 className={styles.title}>Complete Your Payment</h1>
          <p className={styles.subtitle}>
            Pay your deposit to confirm your installation date.
          </p>
        </div>

        {/* Order Summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{tierName} Package</span>
            <span className={styles.summaryValue}>{formatCurrency(totalPrice)}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryRow}>
            <span className={styles.depositLabel}>Deposit Due Today</span>
            <span className={styles.depositAmount}>{formatCurrency(depositAmount)}</span>
          </div>

          <p className={styles.balanceNote}>
            Balance of {formatCurrency(totalPrice - depositAmount)} due upon completion
          </p>
        </div>

        {/* Stripe Payment Form */}
        <div className={styles.stripeFormWrapper}>
          <PaymentForm
            quoteId={quoteId}
            depositAmount={depositAmount}
            onSuccess={handlePaymentSuccess}
            redirectOnSuccess={false}
          />
        </div>
      </div>
    </main>
  );
}

export default PaymentPageClient;
