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
} from 'lucide-react';
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
    const time = timeSlot === 'morning' ? '8:00 AM - 12:00 PM' : '12:00 PM - 5:00 PM';
    return { date: dateFormatted, time };
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
      // Save booking confirmation to our database
      const response = await fetch(`/api/quotes/${quoteId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      // Redirect to portal with success message
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
      <div className={styles.confirmationCard}>
        {/* Success Header */}
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={32} />
          </div>
          <h1 className={styles.title}>You&apos;re Almost There!</h1>
          <p className={styles.subtitle}>
            Confirm your details to lock in your installation date
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={styles.tierBadge}>
              <Sparkles size={16} />
              <span>{quoteSummary.tierDisplayName} Package</span>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <Home size={18} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>Property</span>
                <span className={styles.summaryValue}>{quoteSummary.address}</span>
              </div>
            </div>

            <div className={styles.summaryItem}>
              <Calendar size={18} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>Installation Date</span>
                <span className={styles.summaryValue}>{date}</span>
                <span className={styles.summaryMeta}>{time}</span>
              </div>
            </div>

            <div className={styles.summaryItem}>
              <DollarSign size={18} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>Project Total</span>
                <span className={styles.summaryValue}>
                  ${quoteSummary.totalPrice.toLocaleString()}
                </span>
                <span className={styles.summaryMeta}>
                  ${quoteSummary.depositAmount} deposit due at signing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Your Contact Information</h2>

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
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="customer-phone" className={styles.inputLabel}>
              Phone Number <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              disabled={isProcessing}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* Confirm Button */}
        <button
          type="button"
          className={`${styles.confirmButton} ${!canProceed ? styles.confirmButtonDisabled : ''}`}
          onClick={handleConfirmBooking}
          disabled={!canProceed}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Confirming...
            </>
          ) : (
            <>
              Confirm My Booking
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {/* Trust Message */}
        <div className={styles.trustMessage}>
          <Shield size={16} />
          <span>
            No payment required now. You&apos;ll complete your deposit in your customer portal.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPageClient;
