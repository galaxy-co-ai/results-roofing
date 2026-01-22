'use client';

import { useState } from 'react';
import { Mail, MapPin, Loader2, CheckCircle } from 'lucide-react';
import styles from './OutOfAreaCapture.module.css';

interface OutOfAreaCaptureProps {
  state: string;
  onSubmit?: (email: string, zip: string) => Promise<void>;
  onClose?: () => void;
}

export function OutOfAreaCapture({ state, onSubmit, onClose }: OutOfAreaCaptureProps) {
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email, zip);
      } else {
        // Default: POST to API
        const response = await fetch('/api/leads/out-of-area', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, zip, state }),
        });

        if (!response.ok) {
          throw new Error('Failed to save your information');
        }
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successIcon}>
          <CheckCircle size={48} />
        </div>
        <h3 className={styles.title}>Thank you!</h3>
        <p className={styles.message}>
          We&apos;ll notify you when we expand to your area.
        </p>
        {onClose && (
          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <MapPin size={32} />
      </div>

      <h3 className={styles.title}>We&apos;re not in {state} yet</h3>
      <p className={styles.message}>
        We&apos;d love to serve your area! Leave your email and we&apos;ll let you know when we expand.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={18} />
            <input
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="ZIP code (optional)"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            disabled={isLoading}
            maxLength={10}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              Saving...
            </>
          ) : (
            'Notify Me'
          )}
        </button>
      </form>

      {onClose && (
        <button type="button" className={styles.skipLink} onClick={onClose}>
          No thanks
        </button>
      )}
    </div>
  );
}

export default OutOfAreaCapture;
