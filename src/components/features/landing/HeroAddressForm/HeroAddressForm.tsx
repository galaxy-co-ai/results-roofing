'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { AddressAutocomplete, type ParsedAddress } from '@/components/features/address/AddressAutocomplete';
import { useCreateQuote } from '@/hooks/useQuote';
import styles from './HeroAddressForm.module.css';

interface HeroAddressFormProps {
  className?: string;
}

/**
 * HeroAddressForm - Landing page address autocomplete with quote creation
 *
 * When an address is selected:
 * 1. Creates a quote via API
 * 2. Redirects to the packages page
 *
 * Includes service area validation and error handling.
 */
export function HeroAddressForm({ className = '' }: HeroAddressFormProps) {
  const router = useRouter();
  const createQuoteMutation = useCreateQuote();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfAreaState, setOutOfAreaState] = useState<string | null>(null);

  const handleAddressSelect = useCallback(
    async (address: ParsedAddress) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const quote = await createQuoteMutation.mutateAsync({
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          zip: address.zip,
          lat: address.lat,
          lng: address.lng,
          placeId: address.placeId,
        });

        // Navigate to customize page on success
        router.push(`/quote/${quote.id}/customize`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create quote';
        setError(errorMessage);
        setIsSubmitting(false);
      }
    },
    [createQuoteMutation, router]
  );

  const handleServiceAreaError = useCallback((state: string) => {
    setOutOfAreaState(state);
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.formWrapper}>
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          onServiceAreaError={handleServiceAreaError}
          disabled={isSubmitting}
        />

        {isSubmitting && (
          <div className={styles.loadingOverlay}>
            <Loader2 className={styles.spinner} size={24} />
            <span className={styles.loadingText}>Getting your quote...</span>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {outOfAreaState && !error && (
        <div className={styles.outOfArea}>
          <p className={styles.outOfAreaTitle}>
            We don&apos;t serve {outOfAreaState} yet
          </p>
          <p className={styles.outOfAreaText}>
            Enter your email and we&apos;ll notify you when we expand to your area.
          </p>
          <form
            className={styles.notifyForm}
            onSubmit={(e) => {
              e.preventDefault();
              // This would integrate with email capture
              setOutOfAreaState(null);
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className={styles.notifyInput}
              aria-label="Email for expansion notification"
              required
            />
            <button type="submit" className={styles.notifyButton}>
              Notify Me
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default HeroAddressForm;
