'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AddressAutocomplete, type ParsedAddress } from '@/components/features/address/AddressAutocomplete';
import styles from '../QuoteWizard.module.css';

interface AddressStepProps {
  onNext: (data: {
    quoteId: string;
    address: ParsedAddress;
    estimate: {
      sqft: number;
      sqftRange: { min: number; max: number };
      tiers: Array<{ tier: string; minPrice: number; maxPrice: number }>;
    };
  }) => void;
}

export function AddressStep({ onNext }: AddressStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddressSelect(address: ParsedAddress) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          zip: address.zip,
          lat: address.lat,
          lng: address.lng,
          placeId: address.placeId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create quote');
      }

      const data = await response.json();

      onNext({
        quoteId: data.id,
        address,
        estimate: data.estimate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleServiceAreaError(state: string) {
    setError(`We currently serve TX, GA, NC, AZ, and OK. ${state} is not yet in our service area.`);
  }

  return (
    <div className={styles.stepContent}>
      <AddressAutocomplete
        onAddressSelect={handleAddressSelect}
        onServiceAreaError={handleServiceAreaError}
        disabled={isSubmitting}
      />
      {isSubmitting && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loader2 size={16} className="animate-spin" />
          <span style={{ fontSize: 14, color: 'var(--rr-color-text-secondary)' }}>
            Analyzing your property...
          </span>
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
