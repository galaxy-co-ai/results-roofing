'use client';

import { useState, useCallback } from 'react';
import { Phone, CheckCircle, Loader2 } from 'lucide-react';
import styles from './Stage3.module.css';

interface ContactSectionProps {
  phone: string;
  smsConsent: boolean;
  onSubmit: (phone: string, smsConsent: boolean) => Promise<void>;
  isComplete: boolean;
  isLoading?: boolean;
}

/**
 * Stage 3, Section 1: Contact Information
 * 
 * Captures phone number and SMS consent.
 */
export function ContactSection({
  phone: initialPhone,
  smsConsent: initialConsent,
  onSubmit,
  isComplete,
  isLoading = false,
}: ContactSectionProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [smsConsent, setSmsConsent] = useState(initialConsent);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (value: string): boolean => {
    // Remove non-digits for validation
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const formatPhone = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '').slice(0, 10);
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    if (phoneError) {
      validatePhone(formatted);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validatePhone(phone)) return;

      await onSubmit(phone, smsConsent);
    },
    [phone, smsConsent, onSubmit]
  );

  // Show completed state
  if (isComplete) {
    return (
      <section className={`${styles.section} ${styles.section_complete}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber_complete}>
            <CheckCircle size={20} aria-hidden="true" />
          </div>
          <div className={styles.sectionHeaderText}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <p className={styles.sectionComplete}>
              {phone} • {smsConsent ? 'SMS enabled' : 'No SMS'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>1</div>
        <div className={styles.sectionHeaderText}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <p className={styles.sectionSubtitle}>
            We&apos;ll use this to send you updates about your installation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number
          </label>
          <div className={styles.inputWrapper}>
            <Phone size={18} className={styles.inputIcon} aria-hidden="true" />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => phone && validatePhone(phone)}
              placeholder="(555) 555-5555"
              className={`${styles.input} ${phoneError ? styles.input_error : ''}`}
              disabled={isLoading}
              autoComplete="tel"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'phone-error' : undefined}
            />
          </div>
          {phoneError && (
            <p id="phone-error" className={styles.errorText}>{phoneError}</p>
          )}
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            className={styles.checkbox}
            disabled={isLoading}
          />
          <span className={styles.checkboxText}>
            Yes, send me text message updates about my installation.
            <span className={styles.checkboxSubtext}>
              Message and data rates may apply. Reply STOP to unsubscribe.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || !phone}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </section>
  );
}

export default ContactSection;
