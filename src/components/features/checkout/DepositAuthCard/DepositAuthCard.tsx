'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Sparkles,
  Calendar,
  Check,
  ArrowRight,
  Lock,
  ExternalLink,
  CalendarCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  CheckCircle,
  Star,
} from 'lucide-react';
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
 * Two-column layout: Order Summary (left) | Authorization Form (right)
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
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const canProceed = signature && email && isValidEmail(email) && hasAgreed && !isProcessing;

  // Timeline steps
  const timelineSteps = [
    {
      icon: Mail,
      title: 'Instant Confirmation',
      description: "You'll receive an email confirmation within 5 minutes",
    },
    {
      icon: Phone,
      title: 'Pre-Installation Call',
      description: `We'll contact you 24 hours before your ${formatShortDate(quoteSummary.installDate)} installation`,
    },
    {
      icon: Home,
      title: 'Installation Day',
      description: `Our certified crew arrives ${formatShortDate(quoteSummary.installDate)} @ 8 AM`,
    },
    {
      icon: CheckCircle,
      title: 'Final Walkthrough',
      description: 'We inspect everything together and collect final payment',
    },
  ];

  return (
    <div className={styles.card}>
      {/* ============================================
          LEFT COLUMN: ORDER SUMMARY
          ============================================ */}
      <div className={styles.orderSummary}>
        <div className={styles.summaryHeader}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <Link href={`/quote/${quoteId}/customize`} className={styles.editLink}>
            Edit
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.summaryContent}>
          {/* Package & Price */}
          <div className={styles.packageInfo}>
            <div className={styles.packageIcon}>
              <Sparkles size={18} aria-hidden="true" />
            </div>
            <div className={styles.packageDetails}>
              <span className={styles.packageName}>{quoteSummary.tierDisplayName} Package</span>
              <span className={styles.packagePrice}>
                ${quoteSummary.totalPrice.toLocaleString()} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          RIGHT COLUMN: AUTHORIZATION FORM
          ============================================ */}
      <div className={styles.authorizationForm}>
        {/* Tier Header with Address and Date */}
        <div className={styles.tierHeader}>
          <h2 className={styles.tierTitle}>{quoteSummary.tierDisplayName} Tier</h2>
          <div className={styles.tierInfoRow}>
            <Home size={14} aria-hidden="true" />
            <span>{quoteSummary.address}</span>
          </div>
          <div className={styles.tierInfoRow}>
            <Calendar size={14} aria-hidden="true" />
            <span>{formatDate(quoteSummary.installDate, quoteSummary.timeSlot)}</span>
          </div>
        </div>

        {/* Signature Pad */}
        <div className={styles.signatureContainer}>
          <SignaturePad
            onSignatureChange={onSignatureChange}
            disabled={isProcessing}
            placeholder="Sign here"
          />
        </div>

        {/* Email Input */}
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
          <p className={styles.emailHelp}>We&apos;ll send your contract and receipt here</p>
        </div>

        {/* Terms & Agreement - Collapsible with checkbox */}
        <div className={styles.termsContainer}>
          <div className={styles.termsHeader}>
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
                Terms & Agreement
              </span>
            </label>
            <button
              type="button"
              className={styles.termsToggle}
              onClick={() => setIsTermsOpen(!isTermsOpen)}
              aria-expanded={isTermsOpen}
            >
              {isTermsOpen ? (
                <ChevronUp size={16} aria-hidden="true" />
              ) : (
                <ChevronDown size={16} aria-hidden="true" />
              )}
            </button>
          </div>

          {isTermsOpen && (
            <div className={styles.termsContent}>
              <p className={styles.termsText}>
                I authorize Results Roofing to charge{' '}
                <strong className={styles.highlight}>${quoteSummary.depositAmount}</strong> to
                secure my installation date. This deposit is{' '}
                <strong className={styles.highlightGreen}>fully refundable</strong> if I cancel
                within <strong className={styles.highlight}>3 business days</strong>.
              </p>
            </div>
          )}
        </div>

        {/* What Happens Next - Collapsible */}
        <div className={styles.timelineSection}>
          <button
            type="button"
            className={styles.timelineToggle}
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            aria-expanded={isTimelineOpen}
          >
            <span>What Happens Next</span>
            {isTimelineOpen ? (
              <ChevronUp size={18} aria-hidden="true" />
            ) : (
              <ChevronDown size={18} aria-hidden="true" />
            )}
          </button>

          {isTimelineOpen && (
            <ol className={styles.timeline}>
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={index} className={styles.timelineStep}>
                    <div className={styles.stepNumber}>
                      <span>{index + 1}</span>
                    </div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepHeader}>
                        <Icon size={14} className={styles.stepIcon} aria-hidden="true" />
                        <span className={styles.stepTitle}>{step.title}</span>
                      </div>
                      <p className={styles.stepDescription}>{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* CTA Button */}
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
                Processing...
              </>
            ) : (
              <>
                <Lock size={18} aria-hidden="true" />
                <span>Secure My Spot — ${quoteSummary.depositAmount}</span>
              </>
            )}
          </button>
          {!canProceed && !isProcessing && (
            <p id="cta-hint" className={styles.ctaHint}>
              Please sign above and agree to the terms
            </p>
          )}
        </div>

        {/* Trust indicators below CTA */}
        <div className={styles.miniTrust}>
          <span className={styles.miniTrustItem}>
            <ShieldCheck size={14} aria-hidden="true" />
            Secure
          </span>
          <span className={styles.miniTrustItem}>
            <CalendarCheck size={14} aria-hidden="true" />
            3-Day Refund
          </span>
          <span className={styles.miniTrustItem}>
            <Star size={14} fill="currentColor" aria-hidden="true" />
            4.9 Rating
          </span>
        </div>

        {/* Not Ready Link */}
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
    </div>
  );
}

export default DepositAuthCard;
