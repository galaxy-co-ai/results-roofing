'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useQuoteWizard } from '../../QuoteWizardProvider';
import { useFinalizeCheckout } from '@/hooks/useQuote';
import { QuoteStepper } from '../../QuoteStepper';
import { ContactSection } from './ContactSection';
import { ContractSection } from './ContractSection';
import { SignatureSection } from './SignatureSection';
import { PaymentSection } from './PaymentSection';
import { OrderSummarySidebar } from '../../OrderSummarySidebar';
import styles from './Stage3.module.css';

interface Stage3ContainerProps {
  quoteId: string;
  quoteData: {
    address: string;
    sqft: number;
    selectedTier: {
      tier: string;
      displayName: string;
      totalPrice: number;
      depositAmount: number;
    };
    scheduledDate?: string;
    timeSlot?: string;
    financingTerm?: string;
  };
}

/**
 * Stage 3 Container - Confirm & Pay
 * 
 * All sections render inline (no sub-step navigation):
 * 1. ContactSection - Phone + SMS consent
 * 2. ContractSection - Contract review
 * 3. SignatureSection - Sign contract
 * 4. PaymentSection - Payment form
 */
export function Stage3Container({ quoteId, quoteData }: Stage3ContainerProps) {
  const router = useRouter();
  const {
    state,
    setContact,
    agreeToContract,
    setSignature,
    setQuoteId,
    setLoading,
    setError,
  } = useQuoteWizard();

  const finalizeMutation = useFinalizeCheckout();

  // Track section completion
  const [sectionsComplete, setSectionsComplete] = useState({
    contact: false,
    contract: false,
    signature: false,
    payment: false,
  });

  // Track if contract has been viewed
  const [contractViewed, setContractViewed] = useState(false);

  // Track payment success for inline success display
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Ensure quote ID is set in context
  useEffect(() => {
    if (!state.quoteId && quoteId) {
      setQuoteId(quoteId);
    }
  }, [quoteId, state.quoteId, setQuoteId]);

  // Initialize state from quoteData
  useEffect(() => {
    if (quoteData.scheduledDate) {
      // State is already set from Stage 2, just ensure it's in sync
    }
  }, [quoteData]);

  const handleContactSubmit = useCallback(
    async (phone: string, smsConsent: boolean) => {
      setLoading(true);
      setError(null);

      try {
        // Finalize checkout with contact info and schedule/financing from state
        await finalizeMutation.mutateAsync({
          quoteId,
          phone,
          smsConsent,
          scheduledDate: state.scheduledDate?.toISOString() ?? quoteData.scheduledDate ?? '',
          timeSlot: state.timeSlot ?? (quoteData.timeSlot as 'morning' | 'afternoon') ?? 'morning',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          financingTerm: state.financingTerm ?? (quoteData.financingTerm as 'pay-full' | '12' | '24') ?? 'pay-full',
        });

        setContact(phone, smsConsent);
        setSectionsComplete((prev) => ({ ...prev, contact: true }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save contact info');
      } finally {
        setLoading(false);
      }
    },
    [quoteId, state.scheduledDate, state.timeSlot, state.financingTerm, quoteData, finalizeMutation, setContact, setLoading, setError]
  );

  const handleContractView = useCallback(() => {
    setContractViewed(true);
  }, []);

  const handleContractAgree = useCallback(() => {
    agreeToContract();
    setSectionsComplete((prev) => ({ ...prev, contract: true }));
  }, [agreeToContract]);

  const handleSignatureSubmit = useCallback(
    async (signature: string) => {
      setLoading(true);
      setError(null);

      try {
        // Submit signature to API
        const response = await fetch(`/api/quotes/${quoteId}/contract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signature,
            agreedToTerms: true,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to sign contract');
        }

        setSignature(signature);
        setSectionsComplete((prev) => ({ ...prev, signature: true }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to sign contract');
        throw err; // Re-throw so SignatureCapture can show error
      } finally {
        setLoading(false);
      }
    },
    [quoteId, setSignature, setLoading, setError]
  );

  const handlePaymentSuccess = useCallback(() => {
    setSectionsComplete((prev) => ({ ...prev, payment: true }));
    setPaymentSuccess(true);
    // Redirect to confirmation after short delay
    setTimeout(() => {
      router.push(`/quote/${quoteId}/confirmation`);
    }, 2000);
  }, [quoteId, router]);

  const handlePaymentError = useCallback(
    (error: string) => {
      setError(error);
    },
    [setError]
  );

  // Determine which sections are enabled
  const isContractEnabled = sectionsComplete.contact;
  const isSignatureEnabled = sectionsComplete.contract && contractViewed;
  const isPaymentEnabled = sectionsComplete.signature;

  // Show success state if payment complete
  if (paymentSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>
          <CheckCircle size={64} aria-hidden="true" />
        </div>
        <h2 className={styles.successTitle}>Payment Successful!</h2>
        <p className={styles.successMessage}>
          Your roof replacement has been scheduled. Redirecting to confirmation...
        </p>
      </div>
    );
  }

  // Generate announcement for completed sections
  const getCompletionAnnouncement = (): string => {
    const completedCount = Object.values(sectionsComplete).filter(Boolean).length;
    if (completedCount === 0) return 'Start by entering your contact information';
    if (sectionsComplete.payment) return 'All sections complete';
    if (sectionsComplete.signature) return 'Signature complete, proceed to payment';
    if (sectionsComplete.contract) return 'Contract agreed, please sign below';
    if (sectionsComplete.contact) return 'Contact saved, please review the contract';
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Screen reader announcements for section completion */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getCompletionAnnouncement()}
      </div>

      {/* Unified Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Schedule Installation</h1>
        <QuoteStepper currentStage={3} quoteId={quoteId} />
        <p className={styles.addressLine}>
          <span className={styles.addressLabel}>Quote for</span>
          <span className={styles.addressValue}>{quoteData.address}</span>
        </p>
      </div>

      {/* Main content area with sidebar */}
      <div className={styles.layout}>
        {/* Form sections */}
        <div className={styles.formArea} role="main" aria-label="Checkout form">
          {/* Error display */}
          {state.error && (
            <div className={styles.errorBanner} role="alert">
              <span>{state.error}</span>
            </div>
          )}

          {/* Section 1: Contact Info */}
          <ContactSection
            phone={state.phone}
            smsConsent={state.smsConsent}
            onSubmit={handleContactSubmit}
            isComplete={sectionsComplete.contact}
            isLoading={state.isLoading}
          />

          {/* Section 2: Contract Review */}
          <ContractSection
            quoteId={quoteId}
            quoteData={quoteData}
            onView={handleContractView}
            onAgree={handleContractAgree}
            isComplete={sectionsComplete.contract}
            isEnabled={isContractEnabled}
          />

          {/* Section 3: Signature */}
          <SignatureSection
            onSignatureSubmit={handleSignatureSubmit}
            isComplete={sectionsComplete.signature}
            isEnabled={isSignatureEnabled}
            isLoading={state.isLoading}
          />

          {/* Section 4: Payment */}
          <PaymentSection
            quoteId={quoteId}
            depositAmount={quoteData.selectedTier.depositAmount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            isEnabled={isPaymentEnabled}
          />
        </div>

        {/* Order Summary Sidebar (desktop) */}
        <aside className={styles.sidebarArea}>
          <OrderSummarySidebar
            address={quoteData.address}
            tier={quoteData.selectedTier}
            sqft={quoteData.sqft}
            scheduledDate={state.scheduledDate ?? (quoteData.scheduledDate ? new Date(quoteData.scheduledDate) : undefined)}
            timeSlot={state.timeSlot ?? quoteData.timeSlot}
            financingTerm={state.financingTerm ?? quoteData.financingTerm}
            sectionsComplete={sectionsComplete}
          />
        </aside>
      </div>
    </div>
  );
}

export default Stage3Container;
