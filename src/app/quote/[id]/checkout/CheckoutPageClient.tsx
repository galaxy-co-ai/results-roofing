'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { ScheduleSelector } from '@/components/features/checkout/ScheduleSelector';
import { FinancingSelector } from '@/components/features/checkout/FinancingSelector';
import { TrustSignals } from '@/components/features/quote/TrustSignals';
import { useFinalizeCheckout } from '@/hooks/useQuote';
import { TCPA_CONSENT_TEXT } from '@/lib/constants';
import styles from './page.module.css';

interface CheckoutPageClientProps {
  quoteId: string;
  quote: {
    address: string;
    city: string;
    state: string;
    sqftTotal: string | null;
  };
  tierName: string;
  totalPrice: number;
  depositAmount: number;
  warrantyYears: string;
  warrantyType: string | null;
}

type TimeSlot = 'morning' | 'afternoon';
type FinancingTerm = 'pay-full' | '12' | '24';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CheckoutPageClient({
  quoteId,
  quote,
  tierName,
  totalPrice,
  depositAmount,
  warrantyYears,
  warrantyType,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingTerm | null>(null);
  const [phone, setPhone] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use consolidated finalize mutation (single API call instead of 3)
  const finalizeMutation = useFinalizeCheckout();
  const isSubmitting = finalizeMutation.isPending;

  const canContinue = selectedDate && selectedTimeSlot && selectedFinancing && phone.trim();

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;
    if (!selectedDate || !selectedTimeSlot || !selectedFinancing) return;

    setError(null);

    try {
      // Single consolidated API call for checkout
      await finalizeMutation.mutateAsync({
        quoteId,
        phone: phone.trim(),
        smsConsent,
        scheduledDate: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        financingTerm: selectedFinancing,
      });

      // Navigate to contract page
      router.push(`/quote/${quoteId}/contract`);
    } catch (err) {
      // Transform error to user-friendly message
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(
        message.includes('expired')
          ? message
          : 'Could not save your information. Please try again.'
      );
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/packages`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Change Package
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Order</h1>
          <p className={styles.subtitle}>
            Select your installation date and payment option.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Package</span>
              <span className={styles.summaryValue}>{tierName}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Address</span>
              <span className={styles.summaryValue}>
                {quote.address}, {quote.city}, {quote.state}
              </span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Roof Size</span>
              <span className={styles.summaryValue}>
                {quote.sqftTotal ? parseFloat(quote.sqftTotal).toLocaleString() : '—'} sq ft
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryTotal}>{formatCurrency(totalPrice)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Deposit Due Today</span>
              <span className={styles.summaryDeposit}>{formatCurrency(depositAmount)}</span>
            </div>
          </div>
        </div>

        {/* Schedule Selector */}
        <ScheduleSelector
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onDateChange={setSelectedDate}
          onTimeSlotChange={setSelectedTimeSlot}
          disabled={isSubmitting}
          className={styles.section}
        />

        {/* Financing Selector */}
        <FinancingSelector
          totalAmount={totalPrice}
          selectedTerm={selectedFinancing}
          onTermChange={setSelectedFinancing}
          disabled={isSubmitting}
          className={styles.section}
        />

        {/* Contact Information */}
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>Contact Information</h2>
          <p className={styles.contactSubtitle}>
            We&apos;ll use this to send you updates about your installation.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.inputLabel}>
              Phone Number <span className={styles.inputRequired}>*</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              autoComplete="tel"
              required
            />
          </div>

          <div className={styles.consentGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                disabled={isSubmitting}
                aria-describedby="sms-consent-text"
              />
              <span className={styles.checkboxText}>
                Text me updates about my installation
              </span>
            </label>
            <p id="sms-consent-text" className={styles.consentDisclaimer}>
              {TCPA_CONSENT_TEXT}
            </p>
          </div>
        </div>

        {/* Trust Signals */}
        <TrustSignals variant="full" className={styles.section} />

        {/* Error message */}
        {error && (
          <div className={styles.error} role="alert" aria-live="polite">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || isSubmitting}
          className={styles.continueButton}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Saving...
            </>
          ) : (
            <>
              Continue to Contract
              <ChevronRight size={20} />
            </>
          )}
        </button>

        {/* Included Items */}
        <div className={styles.includedSection}>
          <h3 className={styles.includedTitle}>Included in Your Package</h3>
          <ul className={styles.includedList}>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              Professional installation by licensed crew
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              All permits and inspections
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              Material delivery and staging
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              Complete cleanup and debris removal
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              {warrantyYears}-year {warrantyType} warranty
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPageClient;
