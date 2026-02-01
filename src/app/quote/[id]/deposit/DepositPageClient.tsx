'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { DepositAuthCard, type QuoteSummary } from '@/components/features/checkout/DepositAuthCard';
import { PaymentForm } from '@/components/features/checkout/PaymentForm';
import styles from './page.module.css';

interface DepositPageClientProps {
  quoteId: string;
  quoteSummary: QuoteSummary;
}

type FlowStep = 'authorization' | 'payment' | 'success';

export function DepositPageClient({ quoteId, quoteSummary }: DepositPageClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('authorization');
  const [signature, setSignature] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle signature change
  const handleSignatureChange = useCallback((sig: string | null) => {
    setSignature(sig);
    setError(null);
  }, []);

  // Handle agreement change
  const handleAgreementChange = useCallback((agreed: boolean) => {
    setHasAgreed(agreed);
    setError(null);
  }, []);

  // Handle email change
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError(null);
  }, []);

  // Handle full name change
  const handleFullNameChange = useCallback((value: string) => {
    setFullName(value);
    setError(null);
  }, []);

  // Handle "I need more time" - go to dashboard with pending state
  const handleNeedMoreTime = useCallback(() => {
    router.push('/portal/dashboard?pending=true');
  }, [router]);

  // Handle pay button click - save authorization then show payment
  const handlePayClick = useCallback(async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const hasValidName = fullName.trim().length >= 2;

    if (!signature || !email || !isValidEmail || !hasValidName || !hasAgreed) {
      setError('Please sign, enter your name, email, and agree to the terms to continue.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Save the deposit authorization (signature + name + email + agreement)
      const response = await fetch(`/api/quotes/${quoteId}/deposit-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          fullName: fullName.trim(),
          email: email.trim(),
          agreedToTerms: true,
          termsVersion: '1.0',
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
  }, [quoteId, signature, fullName, email, hasAgreed]);

  // Handle payment success
  const handlePaymentSuccess = useCallback(() => {
    // Redirect to dashboard after successful payment
    router.push('/portal/dashboard');
  }, [router]);

  // Handle payment error
  const handlePaymentError = useCallback((errorMsg: string) => {
    setError(errorMsg);
  }, []);

  // Go back to authorization step
  const handleBackToAuth = useCallback(() => {
    setStep('authorization');
    setError(null);
  }, []);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasValidName = fullName.trim().length >= 2;
  const canProceed = signature && email && isValidEmail && hasValidName && hasAgreed && !isProcessing;

  // Authorization step
  if (step === 'authorization') {
    return (
      <>
        <div className={styles.container}>
          <DepositAuthCard
            quoteId={quoteId}
            quoteSummary={quoteSummary}
            onSignatureChange={handleSignatureChange}
            onEmailChange={handleEmailChange}
            onFullNameChange={handleFullNameChange}
            onAgreementChange={handleAgreementChange}
            onPayClick={handlePayClick}
            onNeedMoreTime={handleNeedMoreTime}
            signature={signature}
            email={email}
            fullName={fullName}
            hasAgreed={hasAgreed}
            isProcessing={isProcessing}
            error={error}
          />
        </div>

        {/* Sticky CTA for mobile */}
        <div className={styles.stickyCta}>
          <button
            type="button"
            className={`${styles.stickyButton} ${!canProceed ? styles.stickyButtonDisabled : ''}`}
            onClick={handlePayClick}
            disabled={!canProceed}
          >
            {isProcessing ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={16} aria-hidden="true" />
                <span>Secure My Spot — ${quoteSummary.depositAmount}</span>
              </>
            )}
          </button>
        </div>
      </>
    );
  }

  // Payment step
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

          {/* Back link */}
          <button
            type="button"
            className={styles.backLink}
            onClick={handleBackToAuth}
          >
            Back to authorization
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default DepositPageClient;
