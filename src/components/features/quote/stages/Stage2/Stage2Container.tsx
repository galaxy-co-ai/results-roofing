'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteWizard } from '../../QuoteWizardProvider';
import { PackageSelection } from './PackageSelection';
import { ScheduleSelection } from './ScheduleSelection';
import { FinancingSelection } from './FinancingSelection';
import styles from './Stage2.module.css';

interface Stage2ContainerProps {
  quoteId: string;
  quoteData: {
    sqft: number;
    address: string;
    tiers: {
      tier: string;
      displayName: string;
      description: string;
      totalPrice: number;
      features: string[];
      isPopular?: boolean;
    }[];
  };
}

/**
 * Stage 2 Container - Customize Your Order
 * 
 * Sub-steps:
 * 1. PackageSelection - Choose Good/Better/Best
 * 2. ScheduleSelection - Pick installation date
 * 3. FinancingSelection - Choose payment option
 */
export function Stage2Container({ quoteId, quoteData }: Stage2ContainerProps) {
  const router = useRouter();
  const {
    state,
    selectTier,
    setSchedule,
    setFinancing,
    goToSubStep,
    nextStep,
    prevStep,
    setQuoteId,
    setLoading,
    setError,
  } = useQuoteWizard();

  // Ensure quote ID is set in context
  useEffect(() => {
    if (!state.quoteId && quoteId) {
      setQuoteId(quoteId);
    }
  }, [quoteId, state.quoteId, setQuoteId]);

  const handleTierSelect = useCallback(
    async (tier: 'good' | 'better' | 'best') => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/quotes/${quoteId}/select-tier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: tier }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to select package');
        }

        selectTier(tier);
        goToSubStep('schedule');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [quoteId, selectTier, goToSubStep, setLoading, setError]
  );

  const handleScheduleSelect = useCallback(
    (date: Date, timeSlot: 'morning' | 'afternoon') => {
      setSchedule(date, timeSlot);
      goToSubStep('financing');
    },
    [setSchedule, goToSubStep]
  );

  const handleFinancingSelect = useCallback(
    (term: 'pay-full' | '12' | '24') => {
      setFinancing(term);
    },
    [setFinancing]
  );

  const handleContinueToCheckout = useCallback(() => {
    if (state.selectedTier && state.scheduledDate && state.financingTerm) {
      router.push(`/quote/${quoteId}/checkout`);
    }
  }, [quoteId, state.selectedTier, state.scheduledDate, state.financingTerm, router]);

  const handleBack = useCallback(() => {
    prevStep();
    // If going back to Stage 1, redirect to the quote new page
    if (state.currentSubStep === 'package') {
      router.push('/quote/new');
    }
  }, [prevStep, state.currentSubStep, router]);

  // Get selected tier data
  const selectedTierData = state.selectedTier
    ? quoteData.tiers.find((t) => t.tier.toLowerCase() === state.selectedTier)
    : null;

  // Render the current sub-step
  const renderSubStep = () => {
    switch (state.currentSubStep) {
      case 'package':
        return (
          <PackageSelection
            tiers={quoteData.tiers}
            sqft={quoteData.sqft}
            address={quoteData.address}
            selectedTier={state.selectedTier}
            onSelect={handleTierSelect}
            isLoading={state.isLoading}
          />
        );

      case 'schedule':
        if (!state.selectedTier) {
          goToSubStep('package');
          return null;
        }
        return (
          <ScheduleSelection
            selectedDate={state.scheduledDate}
            selectedTimeSlot={state.timeSlot}
            onScheduleSelect={handleScheduleSelect}
            onBack={() => goToSubStep('package')}
            isLoading={state.isLoading}
          />
        );

      case 'financing':
        if (!state.selectedTier || !state.scheduledDate) {
          goToSubStep('schedule');
          return null;
        }
        return (
          <FinancingSelection
            totalAmount={selectedTierData?.totalPrice ?? 0}
            selectedTerm={state.financingTerm}
            onTermSelect={handleFinancingSelect}
            onContinue={handleContinueToCheckout}
            onBack={() => goToSubStep('schedule')}
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
    </div>
  );
}

export default Stage2Container;
