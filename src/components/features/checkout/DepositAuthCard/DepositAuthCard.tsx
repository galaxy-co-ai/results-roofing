'use client';

import Link from 'next/link';
import { Home, Sparkles, Calendar, Check, CreditCard, ArrowRight, Lock, ExternalLink, CalendarCheck, ShieldCheck } from 'lucide-react';
import { SignaturePad } from '@/components/ui/SignaturePad/SignaturePad';
import { BenefitPills } from './BenefitPills';
import { DepositIncludes } from './DepositIncludes';
import { SocialProof } from './SocialProof';
import { Timeline } from './Timeline';
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
  /** Quote ID for edit link */
  quoteId: string;
  /** Quote summary data */
  quoteSummary: QuoteSummary;
  /** Called when signature changes */
  onSignatureChange: (signature: string | null) => void;
  /** Called when email changes */
  onEmailChange: (email: string) => void;
  /** Called when agreement checkbox changes */
  onAgreementChange: (agreed: boolean) => void;
  /** Called when ready to pay */
  onPayClick: () => void;
  /** Called when user clicks "I need more time" */
  onNeedMoreTime: () => void;
  /** Current signature value */
  signature: string | null;
  /** Current email value */
  email: string;
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
  quoteId,
  quoteSummary,
  onSignatureChange,
  onEmailChange,
  onAgreementChange,
  onPayClick,
  onNeedMoreTime,
  signature,
  email,
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

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const canProceed = signature && email && isValidEmail(email) && hasAgreed && !isProcessing;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerIcon}>
            <Home size={20} />
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>Save Your Spot Today!</h1>
            <p className={styles.headerSubtitle}>
              One final step to secure your installation date
            </p>
          </div>
        </div>
        <BenefitPills className={styles.benefitPills} />
      </div>

      {/* Quote Summary Card */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h2 className={styles.summaryTitle}>Quote Summary</h2>
          <Link
            href={`/quote/${quoteId}/customize`}
            className={styles.editLink}
          >
            Edit
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.summaryContent}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryIconWrapper}>
              <Home size={16} aria-hidden="true" />
            </div>
            <div className={styles.summaryDetails}>
              <span className={styles.summaryLabel}>Address</span>
              <span className={styles.summaryValue}>{quoteSummary.address}</span>
            </div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryIconWrapper}>
              <Sparkles size={16} aria-hidden="true" />
            </div>
            <div className={styles.summaryDetails}>
              <span className={styles.summaryLabel}>Package</span>
              <span className={styles.summaryValue}>{quoteSummary.tierDisplayName}</span>
            </div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryIconWrapper}>
              <Calendar size={16} aria-hidden="true" />
            </div>
            <div className={styles.summaryDetails}>
              <span className={styles.summaryLabel}>Install Date</span>
              <span className={styles.summaryValue}>
                {formatDate(quoteSummary.installDate, quoteSummary.timeSlot)}
              </span>
            </div>
          </div>
          <div className={styles.summaryTotal}>
            <div className={styles.summaryTotalLabel}>
              <CreditCard size={16} aria-hidden="true" />
              <span>Total</span>
            </div>
            <div className={styles.summaryTotalValue}>
              <span className={styles.totalPrice}>
                ${quoteSummary.totalPrice.toLocaleString()}
              </span>
              <span className={styles.depositNote}>
                (Deposit: ${quoteSummary.depositAmount} today)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Includes */}
      <DepositIncludes
        installDate={quoteSummary.installDate}
        totalPrice={quoteSummary.totalPrice}
        depositAmount={quoteSummary.depositAmount}
      />

      {/* Deposit Authorization */}
      <div className={styles.authSection}>
        <h2 className={styles.authTitle}>Deposit Authorization</h2>

        <div className={styles.authTerms}>
          <p className={styles.termsText}>
            I authorize Results Roofing to charge{' '}
            <strong className={styles.highlight}>${quoteSummary.depositAmount}</strong>{' '}
            to secure my installation date. This deposit is{' '}
            <strong className={styles.highlightGreen}>fully refundable</strong>{' '}
            if I cancel within{' '}
            <strong className={styles.highlight}>3 business days</strong>.
          </p>
        </div>

        <div className={styles.signatureContainer}>
          <SignaturePad
            onSignatureChange={onSignatureChange}
            disabled={isProcessing}
            placeholder="Sign here"
          />
        </div>

        <div className={styles.emailContainer}>
          <label htmlFor="customer-email" className={styles.emailLabel}>
            Your Email *
          </label>
          <input
            id="customer-email"
            type="email"
            className={styles.emailInput}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="your@email.com"
            disabled={isProcessing}
            autoComplete="email"
          />
          <p className={styles.emailHelp}>
            We&apos;ll send your contract and receipt here
          </p>
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
            <Check size={14} className={styles.agreementIcon} aria-hidden="true" />
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
        {/* Mini trust bar above CTA */}
        <div className={styles.miniTrust}>
          <span className={styles.miniTrustItem}>
            <ShieldCheck size={14} aria-hidden="true" />
            Secure Payment
          </span>
          <span className={styles.miniTrustItem}>
            <CalendarCheck size={14} aria-hidden="true" />
            3-Day Refund
          </span>
        </div>

        <div className={styles.ctaWrapper}>
          <button
            type="button"
            className={`${styles.payButton} ${!canProceed ? styles.payButtonDisabled : ''}`}
            onClick={onPayClick}
            disabled={!canProceed}
            aria-describedby={!canProceed ? 'cta-hint' : undefined}
          >
            {isProcessing ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Processing your deposit...
              </>
            ) : (
              <>
                <Lock size={18} aria-hidden="true" />
                <span>Secure My Spot — ${quoteSummary.depositAmount} Deposit</span>
              </>
            )}
          </button>
          {!canProceed && !isProcessing && (
            <p id="cta-hint" className={styles.ctaHint}>
              Please sign above and agree to the terms to continue
            </p>
          )}
        </div>

        <button
          type="button"
          className={styles.laterLink}
          onClick={onNeedMoreTime}
          disabled={isProcessing}
        >
          Not ready? Save this quote
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Social Proof */}
      <SocialProof className={styles.socialProof} />

      {/* What Happens Next Timeline */}
      <Timeline installDate={quoteSummary.installDate} className={styles.timeline} />

      {/* Trust indicators */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <Lock size={14} className={styles.trustIcon} aria-hidden="true" />
          <span>256-bit SSL Encryption</span>
        </div>
        <div className={styles.trustItem}>
          <CalendarCheck size={14} className={styles.trustIcon} aria-hidden="true" />
          <span>3-Day Free Cancellation</span>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.stripeLogo} aria-label="Powered by Stripe">
            <svg viewBox="0 0 60 25" width="48" height="20" aria-hidden="true">
              <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.3 10.3 0 0 1-4.56 1c-4.01 0-6.83-2.5-6.83-7.14 0-4.07 2.5-7.18 6.25-7.18 3.78 0 5.98 2.96 5.98 7.14 0 .47-.02.95-.03 1.26zm-4.1-5.73c-1.1 0-2.01.85-2.14 2.59h4.27c-.05-1.57-.75-2.59-2.13-2.59zm-9.7 10.67c-1.4 0-2.14-.67-2.14-1.93 0-1.24.74-1.93 2.14-1.93s2.14.69 2.14 1.93c0 1.26-.74 1.93-2.14 1.93zm-.35-12.8c1.57 0 2.86.37 3.93.97v3.36c-.97-.6-2.21-.95-3.46-.95-1.03 0-1.57.33-1.57.9 0 .64.79.9 1.76 1.14l.97.26c2.21.6 3.28 1.74 3.28 3.78 0 2.74-2.07 4.32-5.28 4.32a11 11 0 0 1-4.56-.97v-3.46c1.14.74 2.74 1.26 4.13 1.26 1.1 0 1.67-.33 1.67-.95s-.55-.9-1.76-1.17l-.95-.26c-2-.55-3.2-1.55-3.2-3.65 0-2.59 1.98-4.18 5.04-4.18v-.4zm-10.3 12.45V6.68h4.22v12.54h-4.22zm2.11-14.26c-1.3 0-2.28-.95-2.28-2.14s.98-2.14 2.28-2.14c1.33 0 2.31.95 2.31 2.14s-.98 2.14-2.31 2.14zm-9.18 14.32c-1.76 0-3.01-.67-3.81-1.76l-.07 1.5H20.1V.53h4.22v7.14c.79-.93 1.93-1.52 3.53-1.52 3.25 0 5.32 2.76 5.32 6.8 0 4.42-2.33 7.22-5.86 7.22v.05zm-.98-10.6c-1.33 0-2.31.93-2.55 2.33v2.76c.24 1.36 1.17 2.21 2.5 2.21 1.57 0 2.59-1.26 2.59-3.65 0-2.33-1.02-3.65-2.54-3.65zm-8.68 10.6c-2 0-3.55-.57-4.75-1.45v-3.4c1.17.88 2.76 1.5 4.42 1.5 1.1 0 1.67-.33 1.67-.9 0-.6-.57-.88-1.76-1.12l-.95-.24c-2.24-.55-3.28-1.6-3.28-3.7 0-2.64 2-4.18 5.04-4.18 1.5 0 2.83.31 3.93.86v3.32c-.97-.57-2.24-.88-3.48-.88-1.02 0-1.55.31-1.55.85 0 .57.55.83 1.74 1.1l.97.23c2.33.57 3.28 1.67 3.28 3.72 0 2.83-2.1 4.4-5.28 4.4v-.11z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositAuthCard;
