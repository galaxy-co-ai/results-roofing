'use client';

import { CheckCircle, Calendar, MapPin, Phone, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizardData } from '../WizardContext';
import styles from './CheckoutSuccess.module.css';

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format time slot for display
 */
function formatTimeSlot(slot: 'morning' | 'afternoon' | null): string {
  if (!slot) return '';
  return slot === 'morning' ? '8:00 AM - 12:00 PM' : '12:00 PM - 5:00 PM';
}

/**
 * Final step: Success/Confirmation page
 */
export function CheckoutSuccess() {
  const { context } = useWizardData();
  const { address, scheduledDate, timeSlot, phone, email, quoteId } = context;

  return (
    <div className={styles.container}>
      {/* Success icon */}
      <div className={styles.successIcon}>
        <CheckCircle size={64} />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>You&apos;re All Set!</h1>
        <p className={styles.subtitle}>
          Your inspection is booked. We&apos;ve sent a confirmation email to{' '}
          <strong>{email}</strong>
        </p>
      </div>

      {/* Booking details card */}
      <div className={styles.detailsCard}>
        <h2 className={styles.detailsTitle}>Appointment Details</h2>

        <div className={styles.detailsList}>
          {/* Date & Time */}
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Calendar size={18} />
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Date & Time</div>
              <div className={styles.detailValue}>
                {formatDate(scheduledDate)}
                <span className={styles.detailSubvalue}>{formatTimeSlot(timeSlot)}</span>
              </div>
            </div>
          </div>

          {/* Property */}
          {address && (
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <MapPin size={18} />
              </div>
              <div className={styles.detailContent}>
                <div className={styles.detailLabel}>Property</div>
                <div className={styles.detailValue}>
                  {address.streetAddress}
                  <span className={styles.detailSubvalue}>
                    {address.city}, {address.state} {address.zip}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Phone size={18} />
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Contact</div>
              <div className={styles.detailValue}>{phone}</div>
            </div>
          </div>

          {/* Quote ID */}
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Home size={18} />
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Quote ID</div>
              <div className={styles.detailValue}>{quoteId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Go to dashboard (triggers Clerk sign-up/sign-in) */}
      <Button
        onClick={() => window.location.href = '/portal'}
        className="w-full"
      >
        Go to My Dashboard
        <ArrowRight size={18} />
      </Button>

      {/* What to expect */}
      <div className={styles.whatNext}>
        <h3 className={styles.whatNextTitle}>What Happens Next?</h3>
        <ol className={styles.whatNextList}>
          <li>
            <strong>Confirmation email</strong> - Check your inbox for booking details
          </li>
          <li>
            <strong>Day of inspection</strong> - Our inspector will call 30 minutes before arrival
          </li>
          <li>
            <strong>On-site inspection</strong> - Takes about 45-60 minutes
          </li>
          <li>
            <strong>Final quote</strong> - We&apos;ll email your detailed quote within 24 hours
          </li>
        </ol>
      </div>

      {/* Questions */}
      <div className={styles.questions}>
        <p>
          Questions? Call us at <a href="tel:+18007378587">1-800-RESULTS</a> or email{' '}
          <a href="mailto:support@resultsroofing.com">support@resultsroofing.com</a>
        </p>
      </div>

      {/* Return home */}
      <Button
        variant="ghost"
        onClick={() => window.location.href = '/'}
      >
        Return to Homepage
      </Button>
    </div>
  );
}

export default CheckoutSuccess;
