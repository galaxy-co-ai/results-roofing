'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuoteWizard } from '../../QuoteWizardProvider';
import { AddressEntry } from './AddressEntry';
import { PropertyConfirm } from './PropertyConfirm';
import { OutOfAreaCapture } from '@/components/features/address';
import type { ParsedAddress } from '@/components/features/address';
import styles from './Stage1.module.css';

interface Stage1ContainerProps {
  initialAddress?: string;
}

// Get human-readable step name for screen readers
function getSubStepLabel(subStep: string): string {
  switch (subStep) {
    case 'address':
      return 'Enter your address';
    case 'property-confirm':
      return 'Confirm your property';
    default:
      return 'Quote step';
  }
}

/**
 * Stage 1 Container - Get Your Quote
 *
 * Sub-steps:
 * 1. AddressEntry - Enter and validate address
 * 2. PropertyConfirm - Confirm satellite view → then redirect to package selection
 *
 * Also handles out-of-area capture when user's address is outside service area.
 */
export function Stage1Container({ initialAddress = '' }: Stage1ContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, setAddress, confirmProperty, setQuoteId, goToSubStep, setLoading, setError } = useQuoteWizard();
  const [outOfAreaState, setOutOfAreaState] = useState<string | null>(null);
  const [hasCheckedPrefill, setHasCheckedPrefill] = useState(false);

  // Refs for focus management
  const contentRef = useRef<HTMLDivElement>(null);
  const previousSubStep = useRef(state.currentSubStep);

  // Check for prefilled address from landing page
  useEffect(() => {
    if (hasCheckedPrefill) return;

    const isPrefilled = searchParams.get('prefilled') === 'true';
    if (isPrefilled && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('pendingAddress');
        if (stored) {
          const address: ParsedAddress = JSON.parse(stored);
          sessionStorage.removeItem('pendingAddress'); // Clean up
          setAddress(address);
          goToSubStep('property-confirm');
        }
      } catch (e) {
        // If parsing fails, just continue with normal flow
        console.error('Failed to parse prefilled address:', e);
      }
    }
    setHasCheckedPrefill(true);
  }, [searchParams, setAddress, goToSubStep, hasCheckedPrefill]);

  // Focus management: move focus to content when sub-step changes
  useEffect(() => {
    if (previousSubStep.current !== state.currentSubStep) {
      previousSubStep.current = state.currentSubStep;
      // Small delay to allow DOM to update before focusing
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
    }
  }, [state.currentSubStep]);

  const handleAddressSelect = useCallback(
    (address: Parameters<typeof setAddress>[0]) => {
      setOutOfAreaState(null); // Clear any previous out-of-area state
      setAddress(address);
      goToSubStep('property-confirm');
    },
    [setAddress, goToSubStep]
  );

  const handleServiceAreaError = useCallback((detectedState: string) => {
    setOutOfAreaState(detectedState);
  }, []);

  const handleOutOfAreaClose = useCallback(() => {
    setOutOfAreaState(null);
  }, []);

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

      // Go directly to package selection, skipping price preview
      router.push(`/quote/${data.id}/customize`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }, [state.address, setLoading, setError, confirmProperty, setQuoteId, router]);

  const handlePropertyRetry = useCallback(() => {
    goToSubStep('address');
  }, [goToSubStep]);

  // Render the current sub-step
  const renderSubStep = () => {
    // Show out-of-area capture if user's address is outside service area
    if (outOfAreaState) {
      return (
        <OutOfAreaCapture
          state={outOfAreaState}
          onClose={handleOutOfAreaClose}
        />
      );
    }

    switch (state.currentSubStep) {
      case 'address':
        return (
          <AddressEntry
            initialAddress={initialAddress}
            onAddressSelect={handleAddressSelect}
            onServiceAreaError={handleServiceAreaError}
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

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Screen reader announcement for step changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getSubStepLabel(state.currentSubStep)}
      </div>

      {/* Error display */}
      {state.error && (
        <div className={styles.errorBanner} role="alert">
          <span>{state.error}</span>
        </div>
      )}

      {/* Sub-step content with focus management */}
      <div
        ref={contentRef}
        className={styles.subStepContent}
        tabIndex={-1}
        aria-label={getSubStepLabel(state.currentSubStep)}
      >
        {renderSubStep()}
      </div>
    </div>
  );
}

export default Stage1Container;
