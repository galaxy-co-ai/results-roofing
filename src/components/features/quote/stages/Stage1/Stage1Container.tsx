'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteWizard } from '../../QuoteWizardProvider';
import { AddressEntry } from './AddressEntry';
import { PropertyConfirm } from './PropertyConfirm';
import { PricePreview } from './PricePreview';
import { SaveQuoteModal } from '../../SaveQuoteModal';
import styles from './Stage1.module.css';

interface Stage1ContainerProps {
  initialAddress?: string;
}

/**
 * Stage 1 Container - Get Your Quote
 * 
 * Sub-steps:
 * 1. AddressEntry - Enter and validate address
 * 2. PropertyConfirm - Confirm satellite view
 * 3. PricePreview - Show price ranges + option to save
 */
export function Stage1Container({ initialAddress = '' }: Stage1ContainerProps) {
  const router = useRouter();
  const { state, setAddress, confirmProperty, setQuoteId, setPriceRanges, goToSubStep, setLoading, setError } = useQuoteWizard();
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleAddressSelect = useCallback(
    (address: Parameters<typeof setAddress>[0]) => {
      setAddress(address);
      goToSubStep('property-confirm');
    },
    [setAddress, goToSubStep]
  );

  const handlePropertyConfirm = useCallback(async () => {
    if (!state.address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetAddress: state.address.streetAddress,
          city: state.address.city,
          state: state.address.state,
          zip: state.address.zip,
          lat: state.address.lat,
          lng: state.address.lng,
          placeId: state.address.placeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quote');
      }

      confirmProperty();
      setQuoteId(data.id);
      setPriceRanges(data.estimate.tiers);
      goToSubStep('price-preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [state.address, setLoading, setError, confirmProperty, setQuoteId, setPriceRanges, goToSubStep]);

  const handlePropertyRetry = useCallback(() => {
    goToSubStep('address');
  }, [goToSubStep]);

  const handleContinueToPackages = useCallback(() => {
    if (state.quoteId) {
      router.push(`/quote/${state.quoteId}/customize`);
    }
  }, [state.quoteId, router]);

  const handleSaveQuote = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  // Render the current sub-step
  const renderSubStep = () => {
    switch (state.currentSubStep) {
      case 'address':
        return (
          <AddressEntry
            initialAddress={initialAddress}
            onAddressSelect={handleAddressSelect}
            isLoading={state.isLoading}
          />
        );

      case 'property-confirm':
        if (!state.address) {
          // If no address, go back to address entry
          goToSubStep('address');
          return null;
        }
        return (
          <PropertyConfirm
            address={state.address}
            onConfirm={handlePropertyConfirm}
            onRetry={handlePropertyRetry}
            isLoading={state.isLoading}
          />
        );

      case 'price-preview':
        if (!state.priceRanges) {
          // If no price ranges, go back
          goToSubStep('property-confirm');
          return null;
        }
        return (
          <PricePreview
            priceRanges={state.priceRanges}
            onContinue={handleContinueToPackages}
            onSaveQuote={handleSaveQuote}
            isLoading={state.isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Error display */}
      {state.error && (
        <div className={styles.errorBanner} role="alert">
          <span>{state.error}</span>
        </div>
      )}

      {/* Sub-step content */}
      <div className={styles.subStepContent}>
        {renderSubStep()}
      </div>

      {/* Save Quote Modal */}
      {state.quoteId && (
        <SaveQuoteModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          quoteId={state.quoteId}
          draftState={{
            address: state.address ? {
              street: state.address.streetAddress,
              city: state.address.city,
              state: state.address.state as 'TX' | 'GA' | 'NC' | 'AZ' | 'OK',
              zipCode: state.address.zip,
              lat: state.address.lat,
              lng: state.address.lng,
              placeId: state.address.placeId,
            } : undefined,
            propertyConfirmed: state.propertyConfirmed,
            currentStage: 1,
            currentStep: 3,
            lastUpdatedAt: new Date().toISOString(),
          }}
        />
      )}
    </div>
  );
}

export default Stage1Container;
