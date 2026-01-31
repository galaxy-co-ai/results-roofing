'use client';

import { CreditCard, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { PaymentForm } from '@/components/features/checkout/PaymentForm';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import styles from './CheckoutPayment.module.css';

/**
 * Format price for display
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Step 3c: Payment with Stripe Elements
 */
export function CheckoutPayment() {
  const {
    context,
    paymentSucceeded,
    paymentFailed,
    goBack,
    error: wizardError,
    retry,
  } = useWizard();

  const { quoteId, priceRanges, selectedTier, paymentStatus } = context;

  // Calculate deposit amount (10% of selected tier's estimate)
  const selectedPriceRange = priceRanges?.find((p) => p.tier === selectedTier);
  const depositAmount = selectedPriceRange
    ? Math.round(selectedPriceRange.priceEstimate * 0.1)
    : 99; // Fallback deposit

  const handlePaymentSuccess = () => {
    paymentSucceeded();
  };

  const handlePaymentError = (error: string) => {
    paymentFailed(error);
  };

  if (!quoteId) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={24} />
        <p>Unable to load payment. Please go back and try again.</p>
        <Button onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <CreditCard size={24} />
        </div>
        <h1 className={styles.title}>Secure Your Appointment</h1>
        <p className={styles.subtitle}>
          A small deposit holds your inspection slot
        </p>
      </div>

      {/* Deposit amount card */}
      <div className={styles.depositCard}>
        <div className={styles.depositHeader}>
          <span className={styles.depositLabel}>Deposit Amount</span>
          <span className={styles.depositAmount}>{formatPrice(depositAmount)}</span>
        </div>
        <ul className={styles.depositFeatures}>
          <li>100% refundable within 3 days</li>
          <li>Applied to your final invoice</li>
          <li>Includes free on-site inspection</li>
        </ul>
      </div>

      {/* Payment error message */}
      {wizardError && paymentStatus === 'failed' && (
        <div className={styles.paymentError}>
          <AlertCircle size={18} />
          <div className={styles.paymentErrorContent}>
            <p className={styles.paymentErrorTitle}>Payment failed</p>
            <p className={styles.paymentErrorMessage}>{wizardError}</p>
            <button type="button" onClick={retry} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Payment form */}
      <div className={styles.paymentFormWrapper}>
        <PaymentForm
          quoteId={quoteId}
          depositAmount={depositAmount}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          redirectOnSuccess={false}
          useFixedAmount
        />
      </div>

      {/* Security note */}
      <div className={styles.securityNote}>
        <Lock size={14} />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      {/* Back button (desktop) */}
      <div className={styles.desktopNav}>
        <Button
          variant="ghost"
          onClick={goBack}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      {/* Terms */}
      <p className={styles.terms}>
        By completing this payment, you agree to our{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        . Your deposit is fully refundable within 3 business days.
      </p>
    </div>
  );
}

export default CheckoutPayment;
