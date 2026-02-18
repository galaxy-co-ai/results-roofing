'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useQuoteWizard } from '../../QuoteWizardProvider';
import { PackageSelection } from './PackageSelection';
import { ScheduleSelection } from './ScheduleSelection';
import { ReassuranceModal } from '../../ReassuranceModal';
// Financing selection skipped - users handle financing in dashboard after deposit
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
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

// Get human-readable step name for screen readers
function getSubStepLabel(subStep: string): string {
  switch (subStep) {
    case 'package':
      return 'Choose your roofing package';
    case 'schedule':
      return 'Select installation date';
    default:
      return 'Customize your order';
  }
}

/**
 * Stage 2 Container - Customize Your Order
 *
 * Sub-steps:
 * 1. PackageSelection - Choose Good/Better/Best
 * 2. ScheduleSelection - Pick installation date → redirects to deposit page
 */
// Map tier keys to display names
const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Preferred',
  best: 'Signature',
};

export function Stage2Container({ quoteId, quoteData }: Stage2ContainerProps) {
  const {
    state,
    selectTier,
    goToSubStep,
    setQuoteId,
    setLoading,
    setError,
  } = useQuoteWizard();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Reassurance modal state
  const [showReassurance, setShowReassurance] = useState(false);
  const [pendingTier, setPendingTier] = useState<'good' | 'better' | 'best' | null>(null);

  // Refs for focus management
  const contentRef = useRef<HTMLDivElement>(null);
  const previousSubStep = useRef(state.currentSubStep);

  // Ensure quote ID is set in context
  useEffect(() => {
    if (!state.quoteId && quoteId) {
      setQuoteId(quoteId);
    }
  }, [quoteId, state.quoteId, setQuoteId]);

  // Focus management: move focus to content when sub-step changes
  useEffect(() => {
    if (previousSubStep.current !== state.currentSubStep) {
      previousSubStep.current = state.currentSubStep;
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
    }
  }, [state.currentSubStep]);


  const handleTierSelect = useCallback(
    async (tier: 'good' | 'better' | 'best') => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/quotes/${quoteId}/select-tier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to select package');
        }

        selectTier(tier);
        // Show reassurance modal before navigating to schedule
        setPendingTier(tier);
        setShowReassurance(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [quoteId, selectTier, setLoading, setError]
  );

  const handleReassuranceContinue = useCallback(() => {
    setShowReassurance(false);
    setPendingTier(null);
    goToSubStep('schedule');
  }, [goToSubStep]);

  const handleScheduleSelect = useCallback(
    async (date: Date, timeSlot: 'morning' | 'afternoon') => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/quotes/${quoteId}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledDate: date.toISOString(),
            timeSlot,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save schedule');
        }

        // Navigate to deposit page (full page load to ensure fresh data)
        window.location.href = `/quote/${quoteId}/deposit`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setLoading(false);
      }
    },
    [quoteId, setLoading, setError]
  );


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
        // Guard handled by useEffect - just return null if prerequisites not met
        if (!state.selectedTier) {
          return null;
        }
        return (
          <ScheduleSelection
            quoteId={quoteId}
            address={quoteData.address}
            selectedDate={state.scheduledDate}
            selectedTimeSlot={state.timeSlot}
            onScheduleSelect={handleScheduleSelect}
            onBack={() => goToSubStep('package')}
            isLoading={state.isLoading}
          />
        );

      default:
        return null;
    }
  };

  // Get tier info for the reassurance modal
  const pendingTierData = pendingTier
    ? quoteData.tiers.find(t => t.tier.toLowerCase() === pendingTier)
    : null;

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
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentSubStep}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0, 0, 0.2, 1] }}
            onAnimationComplete={() => {
              contentRef.current?.focus();
            }}
          >
            {renderSubStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reassurance modal — shown after package selection */}
      <ReassuranceModal
        open={showReassurance}
        onOpenChange={setShowReassurance}
        tierDisplayName={pendingTier ? (TIER_DISPLAY_NAMES[pendingTier] || pendingTierData?.displayName || '') : ''}
        totalPrice={pendingTierData?.totalPrice || 0}
        onContinue={handleReassuranceContinue}
      />
    </div>
  );
}

export default Stage2Container;
