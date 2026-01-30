'use client';

import { useState, useCallback } from 'react';
import { Home, Sparkles, Calendar, Clock, Check, CreditCard, Shield, ArrowRight } from 'lucide-react';
import { SignaturePad } from '@/components/ui/SignaturePad/SignaturePad';
import styles from './DepositAuthCard.module.css';

export interface QuoteSummary {
  address: string;
  tier: string;
  tierDisplayName: string;
  installDate: string;
  timeSlot: 'morning' | 'afternoon';
  totalPrice: number;
  depositAmount: number;
}

interface DepositAuthCardProps {
  /** Quote summary data */
  quoteSummary: QuoteSummary;
  /** Called when signature changes */
  onSignatureChange: (signature: string | null) => void;
  /** Called when agreement checkbox changes */
  onAgreementChange: (agreed: boolean) => void;
  /** Called when ready to pay */
  onPayClick: () => void;
  /** Called when user clicks "I need more time" */
  onNeedMoreTime: () => void;
  /** Current signature value */
  signature: string | null;
  /** Whether user has agreed to terms */
  hasAgreed: boolean;
  /** Whether payment is being processed */
  isProcessing?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Deposit Authorization Card
 * Collects signature and agreement before payment
 */
export function DepositAuthCard({
  quoteSummary,
  onSignatureChange,
  onAgreementChange,
  onPayClick,
  onNeedMoreTime,
  signature,
  hasAgreed,
  isProcessing = false,
  error = null,
}: DepositAuthCardProps) {
  const formatDate = (dateStr: string, timeSlot: 'morning' | 'afternoon') => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const time = timeSlot === 'morning' ? '8 AM' : '12 PM';
    return `${dateFormatted} @ ${time}`;
  };

  const canProceed = signature && hasAgreed && !isProcessing;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Home size={20} />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Save Your Spot Today!</h1>
          <p className={styles.headerSubtitle}>
            Secure your installation date with a $500 refundable deposit
          </p>
        </div>
      </div>

      {/* Quote Summary */}
      <div className={styles.summarySection}>
        <h2 className={styles.summaryTitle}>Quote Summary</h2>
        <ul className={styles.summaryList}>
          <li className={styles.summaryItem}>
            <Home size={14} className={styles.summaryIcon} />
            <span className={styles.summaryLabel}>Address:</span>
            <span className={styles.summaryValue}>{quoteSummary.address}</span>
          </li>
          <li className={styles.summaryItem}>
            <Sparkles size={14} className={styles.summaryIcon} />
            <span className={styles.summaryLabel}>Package:</span>
            <span className={styles.summaryValue}>{quoteSummary.tierDisplayName}</span>
          </li>
          <li className={styles.summaryItem}>
            <Calendar size={14} className={styles.summaryIcon} />
            <span className={styles.summaryLabel}>Install:</span>
            <span className={styles.summaryValue}>
              {formatDate(quoteSummary.installDate, quoteSummary.timeSlot)}
            </span>
          </li>
          <li className={styles.summaryItem}>
            <CreditCard size={14} className={styles.summaryIcon} />
            <span className={styles.summaryLabel}>Total:</span>
            <span className={styles.summaryValueBold}>
              ${quoteSummary.totalPrice.toLocaleString()}
            </span>
          </li>
        </ul>
      </div>

      {/* Deposit Authorization */}
      <div className={styles.authSection}>
        <h2 className={styles.authTitle}>Deposit Authorization</h2>

        <div className={styles.authTerms}>
          <p className={styles.termsText}>
            &ldquo;I authorize Results Roofing to charge $500 to secure my installation date.
            This deposit is fully refundable if I cancel within 3 business days.&rdquo;
          </p>
        </div>

        <div className={styles.signatureContainer}>
          <SignaturePad
            onSignatureChange={onSignatureChange}
            disabled={isProcessing}
            placeholder="Sign here"
          />
        </div>

        <label className={styles.agreementLabel}>
          <input
            type="checkbox"
            className={styles.agreementCheckbox}
            checked={hasAgreed}
            onChange={(e) => onAgreementChange(e.target.checked)}
            disabled={isProcessing}
          />
          <span className={styles.agreementText}>
            <Check size={14} className={styles.agreementIcon} />
            I agree to the terms above
          </span>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.payButton}
          onClick={onPayClick}
          disabled={!canProceed}
        >
          {isProcessing ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>
              <Shield size={18} />
              Secure My Spot - $500
              <CreditCard size={18} />
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.laterLink}
          onClick={onNeedMoreTime}
          disabled={isProcessing}
        >
          I need more time
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Trust indicators */}
      <div className={styles.trust}>
        <span className={styles.trustItem}>
          <Shield size={12} />
          256-bit SSL
        </span>
        <span className={styles.trustDivider}>|</span>
        <span className={styles.trustItem}>3-day cancellation</span>
        <span className={styles.trustDivider}>|</span>
        <span className={styles.trustItem}>Powered by Stripe</span>
      </div>
    </div>
  );
}

export default DepositAuthCard;
