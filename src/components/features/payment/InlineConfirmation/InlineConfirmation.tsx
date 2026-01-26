'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, Mail, MessageCircle, Home, User, ArrowRight } from 'lucide-react';
import styles from './InlineConfirmation.module.css';

interface InlineConfirmationProps {
  confirmationNumber: string;
  scheduledDate?: Date | null;
  timeSlot?: 'morning' | 'afternoon' | null;
  customerEmail?: string;
  portalUrl?: string;
  className?: string;
}

const NEXT_STEPS = [
  {
    icon: Mail,
    title: 'Check your email',
    description: "We've sent a confirmation email with your contract and receipt.",
  },
  {
    icon: Calendar,
    title: 'Mark your calendar',
    description: "Add the appointment to your calendar. We'll remind you 2 days before.",
  },
  {
    icon: MessageCircle,
    title: "We'll be in touch",
    description: "Our team will call 30 minutes before arrival to confirm.",
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeSlot(slot: 'morning' | 'afternoon'): string {
  return slot === 'morning' ? '8:00 AM - 12:00 PM' : '12:00 PM - 5:00 PM';
}

/**
 * InlineConfirmation - Success display for payment completion
 *
 * Shows animated checkmark, confirmation number, next steps, and CTAs
 * Designed to replace redirect to separate confirmation page
 */
export function InlineConfirmation({
  confirmationNumber,
  scheduledDate,
  timeSlot,
  customerEmail,
  portalUrl = '/portal/dashboard',
  className = '',
}: InlineConfirmationProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Animate in sequence
  useEffect(() => {
    const checkmarkTimer = setTimeout(() => setShowCheckmark(true), 100);
    const contentTimer = setTimeout(() => setShowContent(true), 600);

    return () => {
      clearTimeout(checkmarkTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Success checkmark animation */}
      <div className={styles.checkmarkWrapper}>
        <div className={`${styles.checkmark} ${showCheckmark ? styles.checkmark_visible : ''}`}>
          <CheckCircle size={48} aria-hidden="true" />
        </div>
      </div>

      {/* Main content */}
      <div className={`${styles.content} ${showContent ? styles.content_visible : ''}`}>
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.subtitle}>
          Thank you for your order. Your installation is confirmed.
        </p>

        {/* Confirmation number */}
        <div className={styles.confirmationBox}>
          <span className={styles.confirmationLabel}>Confirmation Number</span>
          <span className={styles.confirmationNumber}>{confirmationNumber}</span>
        </div>

        {/* Appointment details */}
        {scheduledDate && (
          <div className={styles.appointmentCard}>
            <div className={styles.appointmentIcon}>
              <Calendar size={24} aria-hidden="true" />
            </div>
            <div className={styles.appointmentDetails}>
              <span className={styles.appointmentTitle}>Scheduled Installation</span>
              <span className={styles.appointmentDate}>{formatDate(scheduledDate)}</span>
              {timeSlot && (
                <span className={styles.appointmentTime}>{formatTimeSlot(timeSlot)}</span>
              )}
            </div>
          </div>
        )}

        {/* Email notification */}
        {customerEmail && (
          <p className={styles.emailNote}>
            Confirmation sent to <strong>{customerEmail}</strong>
          </p>
        )}

        {/* Next steps */}
        <div className={styles.nextSteps}>
          <h2 className={styles.nextStepsTitle}>What&apos;s Next</h2>
          <ul className={styles.stepsList}>
            {NEXT_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={index} className={styles.step}>
                  <div className={styles.stepIcon}>
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className={styles.stepContent}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <span className={styles.stepDescription}>{step.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTAs */}
        <div className={styles.actions}>
          <Link href={portalUrl} className={styles.primaryButton}>
            <User size={18} aria-hidden="true" />
            View Customer Portal
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/" className={styles.secondaryButton}>
            <Home size={18} aria-hidden="true" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InlineConfirmation;
