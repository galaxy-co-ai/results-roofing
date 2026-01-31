'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, ArrowRight, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import styles from './CheckoutContact.module.css';

/**
 * Format phone number as user types
 */
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Validate phone number
 */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

/**
 * Validate email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Step 3b: Contact information collection
 */
export function CheckoutContact() {
  const { context, setContact, submitContact, goBack, error: wizardError } = useWizard();

  const [phone, setPhone] = useState(context.phone || '');
  const [email, setEmail] = useState(context.email || '');
  const [smsConsent, setSmsConsent] = useState(context.smsConsent || false);

  // Validation state
  const [touched, setTouched] = useState({ phone: false, email: false });
  const [errors, setErrors] = useState({ phone: '', email: '' });

  // Validate on change
  useEffect(() => {
    const newErrors = { phone: '', email: '' };

    if (touched.phone && phone && !isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (touched.email && email && !isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
  }, [phone, email, touched]);

  // Update context as user types
  useEffect(() => {
    setContact(phone, email, smsConsent);
  }, [phone, email, smsConsent, setContact]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBlur = (field: 'phone' | 'email') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    setTouched({ phone: true, email: true });

    if (!isValidPhone(phone) || !isValidEmail(email)) {
      return;
    }

    submitContact();
  };

  const canSubmit = isValidPhone(phone) && isValidEmail(email);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <User size={24} />
        </div>
        <h1 className={styles.title}>Contact Information</h1>
        <p className={styles.subtitle}>
          We&apos;ll use this to confirm your appointment and send updates
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Phone */}
        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>
            <Phone size={16} />
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur('phone')}
            placeholder="(555) 555-5555"
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            autoComplete="tel"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <div className={styles.fieldError} id="phone-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            <Mail size={16} />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            placeholder="you@example.com"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <div className={styles.fieldError} id="email-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* SMS Consent */}
        <div className={styles.consentSection}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxCustom} />
            <span className={styles.checkboxLabel}>
              <MessageSquare size={14} />
              Text me appointment reminders and updates
            </span>
          </label>
          <p className={styles.consentNote}>
            By checking this box, you agree to receive SMS messages. Message and data
            rates may apply. Reply STOP to opt out.
          </p>
        </div>

        {/* Wizard error */}
        {wizardError && (
          <div className={styles.error} role="alert" aria-live="assertive">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{wizardError}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={!canSubmit}
          size="lg"
          className="w-full"
        >
          Continue to Payment
          <ArrowRight size={18} />
        </Button>
      </form>

      {/* Desktop back button */}
      <div className={styles.desktopNav}>
        <Button variant="ghost" onClick={goBack} type="button">
          Back
        </Button>
      </div>

      {/* Privacy note */}
      <p className={styles.privacyNote}>
        Your information is secure and will only be used to complete your booking.
        We never share your data with third parties.
      </p>
    </div>
  );
}

export default CheckoutContact;
