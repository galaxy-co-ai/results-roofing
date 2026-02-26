'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../QuoteWizard.module.css';

interface ContactStepProps {
  quoteId: string;
  email: string;
  onComplete: () => void;
}

export function ContactStep({ quoteId, email, onComplete }: ContactStepProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.trim().length >= 2 && phone.trim().length >= 10 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Submit contact info
      const contactRes = await fetch(`/api/quotes/${quoteId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), smsConsent }),
      });

      if (!contactRes.ok) {
        const data = await contactRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save contact info');
      }

      // Step 2: Confirm booking
      const confirmRes = await fetch(`/api/quotes/${quoteId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email,
          phone: phone.trim(),
        }),
      });

      if (!confirmRes.ok) {
        const data = await confirmRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to confirm booking');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="full-name" className={styles.label}>Full Name</label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Smith"
            className={styles.input}
            disabled={isSubmitting}
            autoComplete="name"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="phone" className={styles.label}>Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className={styles.input}
            disabled={isSubmitting}
            autoComplete="tel"
          />
        </div>

        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label htmlFor="email-display" className={styles.label}>Email</label>
          <input
            id="email-display"
            type="email"
            value={email}
            readOnly
            className={styles.input}
            style={{ opacity: 0.7 }}
          />
        </div>

        <div className={styles.fullWidth}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className={styles.checkboxInput}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxLabel}>
              I agree to receive text messages about my roofing project. Message &amp; data rates may apply.
            </span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={styles.primaryButton}
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Get My Quote'}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
