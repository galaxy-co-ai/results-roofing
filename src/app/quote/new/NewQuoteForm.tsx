'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Loader2, AlertCircle, Home, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ'];

export default function NewQuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAddress = searchParams.get('address') || '';

  const [address, setAddress] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Create new quote via API
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quote');
      }

      // Redirect to measuring page (which will show satellite measurement progress)
      router.push(`/quote/${data.id}/measuring`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Home size={32} />
          </div>
          <h1 className={styles.title}>Get Your Instant Quote</h1>
          <p className={styles.subtitle}>
            Enter your home address and we&apos;ll measure your roof using satellite imagery.
            You&apos;ll get pricing options in minutes.
          </p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>
              Property Address
            </label>
            <div className={styles.inputWrapper}>
              <MapPin className={styles.inputIcon} size={20} />
              <input
                id="address"
                type="text"
                name="address"
                className={styles.input}
                placeholder="123 Main Street, City, State ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                required
                disabled={isLoading}
              />
            </div>
            <p className={styles.hint}>
              Enter your full street address including city, state, and ZIP code
            </p>
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !address.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Measuring Your Roof...
              </>
            ) : (
              <>
                Get My Quote
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Service Area Notice */}
        <div className={styles.serviceAreaNotice}>
          <p className={styles.serviceAreaTitle}>Service Areas</p>
          <p className={styles.serviceAreaText}>
            We currently serve self-pay customers in{' '}
            <strong>{SERVICE_STATES.join(', ')}</strong>.
            No insurance claims accepted.
          </p>
        </div>
      </div>
    </main>
  );
}
