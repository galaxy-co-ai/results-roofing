'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
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
 * 2. Redirects to the customize page
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
    <div className={`${styles.card} ${className}`}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconBadge}>
          <MapPin size={20} />
        </div>
        <div className={styles.headerText}>
          <h2 className={styles.cardTitle}>Get Your Free Quote</h2>
          <p className={styles.cardSubtitle}>Enter your address to start</p>
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
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

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.trustIndicators}>
          <span className={styles.trustItem}>
            <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No credit card required
          </span>
          <span className={styles.trustItem}>
            <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Instant satellite measurement
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeroAddressForm;
