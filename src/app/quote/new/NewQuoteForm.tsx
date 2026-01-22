'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Home, ChevronRight } from 'lucide-react';
import { AddressAutocomplete, OutOfAreaCapture, type ParsedAddress } from '@/components/features/address';
import styles from './page.module.css';

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ'];

export default function NewQuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAddress = searchParams.get('address') || '';

  const [selectedAddress, setSelectedAddress] = useState<ParsedAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfAreaState, setOutOfAreaState] = useState<string | null>(null);

  const handleAddressSelect = useCallback((address: ParsedAddress) => {
    setSelectedAddress(address);
    setError(null);
    setOutOfAreaState(null);
  }, []);

  const handleServiceAreaError = useCallback((state: string) => {
    setOutOfAreaState(state);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedAddress) {
      setError('Please select an address from the dropdown');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Create new quote via API with structured address
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
          placeId: selectedAddress.placeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.outOfArea) {
          setOutOfAreaState(data.state);
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to create quote');
      }

      // Redirect to estimate page with preliminary pricing
      router.push(`/quote/${data.id}/estimate`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }

  // Show out-of-area capture form if address is outside service area
  if (outOfAreaState) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <OutOfAreaCapture
            state={outOfAreaState}
            onClose={() => setOutOfAreaState(null)}
          />
        </div>
      </main>
    );
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
            Enter your home address to see estimated pricing in seconds.
            No phone calls, no waiting.
          </p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>
              Property Address
            </label>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              onServiceAreaError={handleServiceAreaError}
              initialValue={initialAddress}
              disabled={isLoading}
              serviceStates={SERVICE_STATES}
            />
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
            disabled={isLoading || !selectedAddress}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Getting Your Estimate...
              </>
            ) : (
              <>
                See My Pricing
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
