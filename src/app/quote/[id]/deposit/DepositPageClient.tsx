'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileSignature, Loader2, Home, Calendar, Sparkles } from 'lucide-react';
import { DocusealForm } from '@docuseal/react';
import { PaymentForm } from '@/components/features/checkout/PaymentForm';
import styles from './page.module.css';

export interface QuoteSummary {
  address: string;
  tier: string;
  tierDisplayName: string;
  installDate: string;
  timeSlot: 'morning' | 'afternoon';
  totalPrice: number;
  depositAmount: number;
}

interface DepositPageClientProps {
  quoteId: string;
  quoteSummary: QuoteSummary;
}

type FlowStep = 'info' | 'signing' | 'payment';

export function DepositPageClient({ quoteId, quoteSummary }: DepositPageClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('info');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Create DocuSeal submission and get embed URL
  const handleStartSigning = useCallback(async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const hasValidName = fullName.trim().length >= 2;

    if (!isValidEmail || !hasValidName) {
      setError('Please enter your full name and a valid email address.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/docuseal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerEmail: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create signing document');
      }

      setEmbedSrc(data.embedSrc);
      setStep('signing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [quoteId, email, fullName]);

  // Handle DocuSeal form completion
  const handleSigningComplete = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Save the authorization to our database
      const response = await fetch(`/api/quotes/${quoteId}/deposit-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: 'docuseal-completed', // Placeholder - actual sig is in DocuSeal
          fullName: fullName.trim(),
          email: email.trim(),
          agreedToTerms: true,
          termsVersion: '1.0-docuseal',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save authorization');
      }

      // Move to payment step
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [quoteId, fullName, email]);

  // Handle payment success
  const handlePaymentSuccess = useCallback(() => {
    router.push('/portal/dashboard');
  }, [router]);

  // Handle payment error
  const handlePaymentError = useCallback((errorMsg: string) => {
    setError(errorMsg);
  }, []);

  // Go back to info step
  const handleBackToInfo = useCallback(() => {
    setStep('info');
    setEmbedSrc(null);
    setError(null);
  }, []);

  // Handle "I need more time"
  const handleNeedMoreTime = useCallback(() => {
    router.push('/portal/dashboard?pending=true');
  }, [router]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasValidName = fullName.trim().length >= 2;
  const canProceed = isValidEmail && hasValidName && !isProcessing;

  // Step 1: Collect info
  if (step === 'info') {
    return (
      <div className={styles.container}>
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <FileSignature size={24} className={styles.headerIcon} aria-hidden="true" />
            <h1 className={styles.cardTitle}>Authorize Your Deposit</h1>
            <p className={styles.cardSubtitle}>
              Enter your details to sign the authorization and secure your spot
            </p>
          </div>

          {/* Quote Summary */}
          <div className={styles.quoteSummary}>
            <div className={styles.summaryHeader}>
              <div className={styles.tierBadge}>
                <Sparkles size={16} aria-hidden="true" />
                <span>{quoteSummary.tierDisplayName}</span>
              </div>
            </div>
            <div className={styles.summaryDetails}>
              <div className={styles.detailItem}>
                <Home size={14} aria-hidden="true" />
                <span>{quoteSummary.address}</span>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={14} aria-hidden="true" />
                <span>{formatDate(quoteSummary.installDate, quoteSummary.timeSlot)}</span>
              </div>
            </div>
            <div className={styles.summaryPricing}>
              <div className={styles.pricingRow}>
                <span>Total Project</span>
                <span className={styles.totalPrice}>${quoteSummary.totalPrice.toLocaleString()}</span>
              </div>
              <div className={styles.pricingRow}>
                <span>Deposit Today</span>
                <span className={styles.depositPrice}>${quoteSummary.depositAmount}</span>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="customer-name" className={styles.inputLabel}>
              Full Name <span className={styles.required}>*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              className={styles.input}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="John Smith"
              disabled={isProcessing}
              autoComplete="name"
            />
          </div>

          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="customer-email" className={styles.inputLabel}>
              Email Address <span className={styles.required}>*</span>
            </label>
            <input
              id="customer-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="john@example.com"
              disabled={isProcessing}
              autoComplete="email"
            />
            <p className={styles.inputHelp}>
              We&apos;ll send your signed contract and receipt here
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {/* Continue Button */}
          <button
            type="button"
            className={`${styles.primaryButton} ${!canProceed ? styles.primaryButtonDisabled : ''}`}
            onClick={handleStartSigning}
            disabled={!canProceed}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
                Preparing Document...
              </>
            ) : (
              <>
                <FileSignature size={18} aria-hidden="true" />
                Continue to Sign
              </>
            )}
          </button>

          {/* Not Ready Link */}
          <button
            type="button"
            className={styles.laterLink}
            onClick={handleNeedMoreTime}
            disabled={isProcessing}
          >
            Not ready? Save this quote for later
          </button>
        </div>
      </div>
    );
  }

  // Step 2: DocuSeal Signing
  if (step === 'signing' && embedSrc) {
    return (
      <div className={styles.container}>
        <div className={styles.signingCard}>
          <div className={styles.signingHeader}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBackToInfo}
              disabled={isProcessing}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>
            <h1 className={styles.signingTitle}>Sign Authorization</h1>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className={styles.processingOverlay}>
              <Loader2 size={32} className={styles.spinnerLarge} aria-hidden="true" />
              <p>Processing your signature...</p>
            </div>
          )}

          {/* DocuSeal Embed */}
          <div className={styles.docusealContainer}>
            <DocusealForm
              src={embedSrc}
              email={email}
              onComplete={handleSigningComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Payment
  if (step === 'payment') {
    return (
      <div className={styles.container}>
        <div className={styles.paymentCard}>
          <div className={styles.paymentHeader}>
            <h1 className={styles.paymentTitle}>Complete Payment</h1>
            <p className={styles.paymentSubtitle}>
              Enter your payment details to secure your installation date
            </p>
          </div>

          {/* Summary reminder */}
          <div className={styles.paymentSummary}>
            <div className={styles.summaryRow}>
              <span>Deposit Amount</span>
              <span className={styles.summaryAmount}>${quoteSummary.depositAmount}</span>
            </div>
            <div className={styles.summaryNote}>
              Refundable within 3 business days
            </div>
          </div>

          {/* Error from payment */}
          {error && (
            <div className={styles.paymentError} role="alert">
              {error}
            </div>
          )}

          {/* Payment form */}
          <PaymentForm
            quoteId={quoteId}
            depositAmount={quoteSummary.depositAmount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            redirectOnSuccess={false}
            useFixedAmount={true}
          />
        </div>
      </div>
    );
  }

  return null;
}

export default DepositPageClient;
