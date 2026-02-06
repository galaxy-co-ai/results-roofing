'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Loader2,
  Home,
  Calendar,
  Sparkles,
  DollarSign,
  ArrowRight,
  Shield,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { QuoteStepper } from '@/components/features/quote';
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

interface ConfirmPageClientProps {
  quoteId: string;
  quoteSummary: QuoteSummary;
}

export function ConfirmPageClient({ quoteId, quoteSummary }: ConfirmPageClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string, timeSlot: 'morning' | 'afternoon') => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const time = timeSlot === 'morning' ? '8 AM - 12 PM' : '12 PM - 5 PM';
    return { date: dateFormatted, time };
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleConfirmBooking = useCallback(async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const hasValidName = fullName.trim().length >= 2;

    if (!isValidEmail || !hasValidName) {
      setError('Please enter your full name and a valid email address.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, '') || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      router.push(`/portal/dashboard?confirmed=${quoteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [quoteId, email, fullName, phone, router]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasValidName = fullName.trim().length >= 2;
  const canProceed = isValidEmail && hasValidName && !isProcessing;

  const { date, time } = formatDate(quoteSummary.installDate, quoteSummary.timeSlot);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Confirm Your Booking</h1>
        <QuoteStepper currentStage={4} quoteId={quoteId} />
      </div>

      {/* Compact Quote Summary Bar */}
      <div className={styles.quoteSummaryBar}>
        <div className={styles.quoteSummaryContent}>
          <div className={styles.quoteSummaryIconWrapper}>
            <Home aria-hidden="true" />
          </div>
          <span className={styles.quoteSummaryAddress}>{quoteSummary.address}</span>
          <span className={styles.quoteSummaryDivider} aria-hidden="true" />
          <span className={styles.quoteSummaryTier}>
            <Sparkles className={styles.tierIcon} aria-hidden="true" />
            {quoteSummary.tierDisplayName}
          </span>
          <span className={styles.quoteSummaryDivider} aria-hidden="true" />
          <span className={styles.quoteSummaryPrice}>
            ${quoteSummary.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Booking Summary Card */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconSuccess}>
            <CheckCircle2 />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Your Installation</h2>
            <p className={styles.sectionSubtitle}>Review your booking details</p>
          </div>
        </div>

        <div className={styles.bookingSummary}>
          <div className={styles.bookingRow}>
            <Calendar className={styles.bookingIcon} aria-hidden="true" />
            <div className={styles.bookingDetails}>
              <span className={styles.bookingLabel}>Date & Time</span>
              <span className={styles.bookingValue}>{date}</span>
              <span className={styles.bookingMeta}>{time}</span>
            </div>
          </div>
          <div className={styles.bookingRow}>
            <DollarSign className={styles.bookingIcon} aria-hidden="true" />
            <div className={styles.bookingDetails}>
              <span className={styles.bookingLabel}>Project Total</span>
              <span className={styles.bookingValue}>${quoteSummary.totalPrice.toLocaleString()}</span>
              <span className={styles.bookingMeta}>${quoteSummary.depositAmount} deposit due at signing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <form className={styles.section} onSubmit={(e) => { e.preventDefault(); handleConfirmBooking(); }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <User />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Your Information</h2>
            <p className={styles.sectionSubtitle}>We&apos;ll use this to create your account</p>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="customer-name" className={styles.inputLabel}>
              <User className={styles.inputIcon} aria-hidden="true" />
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

          <div className={styles.inputGroup}>
            <label htmlFor="customer-email" className={styles.inputLabel}>
              <Mail className={styles.inputIcon} aria-hidden="true" />
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
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="customer-phone" className={styles.inputLabel}>
              <Phone className={styles.inputIcon} aria-hidden="true" />
              Phone Number <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              className={styles.input}
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              disabled={isProcessing}
              autoComplete="tel"
              maxLength={14}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!canProceed}
        >
          {isProcessing ? (
            <>
              <Loader2 className={styles.spinner} aria-hidden="true" />
              Saving...
            </>
          ) : (
            <>
              View My Project
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </button>

        {/* Trust Message */}
        <div className={styles.trustMessage}>
          <Shield className={styles.trustIcon} aria-hidden="true" />
          <span>
            No payment required now. You&apos;ll complete your deposit in your customer portal.
          </span>
        </div>
      </form>
    </div>
  );
}

export default ConfirmPageClient;
