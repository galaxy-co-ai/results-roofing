'use client';

import { CheckCircle, Calendar, MapPin, Phone, Home } from 'lucide-react';
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
  const { address, scheduledDate, timeSlot, phone, email, quoteId, selectedTier } = context;

  const handleAddToCalendar = () => {
    if (!scheduledDate || !timeSlot) return;

    // Create calendar event details
    const startTime = new Date(scheduledDate);
    const endTime = new Date(scheduledDate);

    if (timeSlot === 'morning') {
      startTime.setHours(8, 0, 0);
      endTime.setHours(12, 0, 0);
    } else {
      startTime.setHours(12, 0, 0);
      endTime.setHours(17, 0, 0);
    }

    const title = 'Results Roofing - Roof Inspection';
    const location = address?.formattedAddress || '';
    const description = `Your free roof inspection with Results Roofing.\n\nQuote ID: ${quoteId}\n\nOur inspector will call 30 minutes before arrival.`;

    // Google Calendar URL
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', title);
    googleUrl.searchParams.append('dates', `${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    googleUrl.searchParams.append('location', location);
    googleUrl.searchParams.append('details', description);

    window.open(googleUrl.toString(), '_blank');
  };

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

      {/* Add to calendar */}
      <Button
        onClick={handleAddToCalendar}
        variant="secondary"
        className="w-full"
      >
        <Calendar size={18} />
        Add to Calendar
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
          Questions? Call us at <a href="tel:+15551234567">(555) 123-4567</a> or email{' '}
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
