'use client';

import { createContext, useContext, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import {
  wizardMachine,
  getStageFromState,
  getProgressPercentage,
  getStepInfo,
  type WizardContext as WizardContextType,
  type WizardStage,
  type TierPriceRange,
} from './WizardMachine';
import type { ParsedAddress } from '@/components/features/address';

/**
 * Values exposed through context
 */
interface WizardContextValue {
  // Current state
  state: string;
  stage: WizardStage;
  context: WizardContextType;
  progress: number;
  stepInfo: { step: number; total: number; label: string };

  // Loading states
  isLoading: boolean;

  // Navigation direction for animations
  direction: 'forward' | 'backward';

  // Actions
  setAddress: (address: ParsedAddress) => void;
  confirmProperty: () => void;
  selectTier: (tier: 'good' | 'better' | 'best', tierId: string) => void;
  setSchedule: (date: Date, timeSlot: 'morning' | 'afternoon') => void;
  setContact: (phone: string, email: string, smsConsent: boolean) => void;
  submitContact: () => void;
  paymentStarted: (paymentIntentId: string) => void;
  paymentSucceeded: () => void;
  paymentFailed: (error: string) => void;
  goBack: () => void;
  retry: () => void;

  // Helpers
  canGoBack: boolean;
  error: string | null;
}

const WizardReactContext = createContext<WizardContextValue | null>(null);

/**
 * Props for the provider
 */
interface WizardProviderProps {
  children: ReactNode;
  quoteId?: string;
  initialContext?: Partial<WizardContextType>;
  initialState?: string;
}

/**
 * Parse context data - handles date string conversion
 */
function parseContextData(
  context: Partial<WizardContextType>,
  quoteId?: string
): Partial<WizardContextType> {
  // Parse scheduledDate if it's a string (from JSON)
  let scheduledDate = context.scheduledDate;
  if (typeof scheduledDate === 'string') {
    scheduledDate = new Date(scheduledDate);
  }

  return {
    ...context,
    quoteId: quoteId || context.quoteId || null,
    scheduledDate: scheduledDate as Date | null,
  };
}

/**
 * Provider component that wraps XState machine
 */
export function WizardProvider({
  children,
  quoteId,
  initialContext,
  initialState,
}: WizardProviderProps) {
  // Parse the initial context (convert date strings, set quoteId)
  const parsedContext = useMemo(() => {
    if (initialContext) {
      return parseContextData(initialContext, quoteId);
    }
    return quoteId ? { quoteId } : undefined;
  }, [initialContext, quoteId]);

  // Create machine with initial context
  const [snapshot, send] = useMachine(wizardMachine);

  // Track if we've hydrated the initial state
  const hasHydratedRef = useRef(false);

  // Hydrate with initial context and state on mount
  useEffect(() => {
    if (!hasHydratedRef.current && parsedContext) {
      hasHydratedRef.current = true;
      send({ type: 'HYDRATE', data: parsedContext, state: initialState });
    }
  }, [parsedContext, initialState, send]);

  // Extract current state value (handles nested states)
  const stateValue = typeof snapshot.value === 'string'
    ? snapshot.value
    : Object.keys(snapshot.value)[0];

  // Computed values
  const stage = useMemo(() => getStageFromState(stateValue), [stateValue]);
  const progress = useMemo(() => getProgressPercentage(stateValue), [stateValue]);
  const stepInfo = useMemo(() => getStepInfo(stateValue), [stateValue]);
  const isLoading = ['creatingQuote', 'savingTier', 'finalizing'].includes(stateValue);

  // Actions
  const setAddress = useCallback((address: ParsedAddress) => {
    send({ type: 'SET_ADDRESS', address });
  }, [send]);

  const confirmProperty = useCallback(() => {
    send({ type: 'CONFIRM_PROPERTY' });
  }, [send]);

  const selectTier = useCallback((tier: 'good' | 'better' | 'best', tierId: string) => {
    send({ type: 'SELECT_TIER', tier, tierId });
  }, [send]);

  const setSchedule = useCallback((date: Date, timeSlot: 'morning' | 'afternoon') => {
    send({ type: 'SET_SCHEDULE', date, timeSlot });
  }, [send]);

  const setContact = useCallback((phone: string, email: string, smsConsent: boolean) => {
    send({ type: 'SET_CONTACT', phone, email, smsConsent });
  }, [send]);

  const submitContact = useCallback(() => {
    send({ type: 'SUBMIT_CONTACT' });
  }, [send]);

  const paymentStarted = useCallback((paymentIntentId: string) => {
    send({ type: 'PAYMENT_STARTED', paymentIntentId });
  }, [send]);

  const paymentSucceeded = useCallback(() => {
    send({ type: 'PAYMENT_SUCCEEDED' });
  }, [send]);

  const paymentFailed = useCallback((error: string) => {
    send({ type: 'PAYMENT_FAILED', error });
  }, [send]);

  const goBack = useCallback(() => {
    send({ type: 'BACK' });
  }, [send]);

  const retry = useCallback(() => {
    send({ type: 'RETRY' });
  }, [send]);

  // Determine if back navigation is possible
  const canGoBack = !['address', 'creatingQuote', 'savingTier', 'finalizing', 'success'].includes(stateValue);

  // Auto-save checkpoint on state transitions
  const prevStateRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States where we save a checkpoint (user can resume from these)
  const SAVEABLE_STATES = ['confirm', 'select', 'schedule', 'contact', 'payment'];

  useEffect(() => {
    const shouldSave =
      SAVEABLE_STATES.includes(stateValue) &&
      prevStateRef.current !== stateValue &&
      snapshot.context.quoteId;

    if (shouldSave) {
      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save to avoid excessive API calls
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const checkpointData = {
            state: stateValue,
            context: {
              quoteId: snapshot.context.quoteId,
              address: snapshot.context.address,
              propertyConfirmed: snapshot.context.propertyConfirmed,
              sqftEstimate: snapshot.context.sqftEstimate,
              priceRanges: snapshot.context.priceRanges,
              selectedTier: snapshot.context.selectedTier,
              selectedTierId: snapshot.context.selectedTierId,
              scheduledDate: snapshot.context.scheduledDate?.toISOString() || null,
              timeSlot: snapshot.context.timeSlot,
              phone: snapshot.context.phone,
              email: snapshot.context.email,
              smsConsent: snapshot.context.smsConsent,
              paymentIntentId: snapshot.context.paymentIntentId,
              paymentStatus: snapshot.context.paymentStatus,
            },
          };

          await fetch(`/api/quote-v2/${snapshot.context.quoteId}/checkpoint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkpointData),
          });
        } catch (err) {
          // Silently fail - checkpoint is non-critical
          console.warn('Failed to save wizard checkpoint:', err);
        }
      }, 500);
    }

    prevStateRef.current = stateValue;

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [stateValue, snapshot.context]);

  const value = useMemo<WizardContextValue>(() => ({
    state: stateValue,
    stage,
    context: snapshot.context,
    progress,
    stepInfo,
    isLoading,
    direction: snapshot.context.navigationDirection,
    setAddress,
    confirmProperty,
    selectTier,
    setSchedule,
    setContact,
    submitContact,
    paymentStarted,
    paymentSucceeded,
    paymentFailed,
    goBack,
    retry,
    canGoBack,
    error: snapshot.context.error,
  }), [
    stateValue,
    stage,
    snapshot.context,
    progress,
    stepInfo,
    isLoading,
    setAddress,
    confirmProperty,
    selectTier,
    setSchedule,
    setContact,
    submitContact,
    paymentStarted,
    paymentSucceeded,
    paymentFailed,
    goBack,
    retry,
    canGoBack,
  ]);

  return (
    <WizardReactContext.Provider value={value}>
      {children}
    </WizardReactContext.Provider>
  );
}

/**
 * Hook to access wizard context
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardReactContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

/**
 * Hook to access just the context data (for components that only read)
 */
export function useWizardData() {
  const { context, state, stage, progress, stepInfo, direction, error, isLoading } = useWizard();
  return { context, state, stage, progress, stepInfo, direction, error, isLoading };
}

/**
 * Hook to access just the actions (for components that only dispatch)
 */
export function useWizardActions() {
  const {
    setAddress,
    confirmProperty,
    selectTier,
    setSchedule,
    setContact,
    submitContact,
    paymentStarted,
    paymentSucceeded,
    paymentFailed,
    goBack,
    retry,
    canGoBack,
  } = useWizard();

  return {
    setAddress,
    confirmProperty,
    selectTier,
    setSchedule,
    setContact,
    submitContact,
    paymentStarted,
    paymentSucceeded,
    paymentFailed,
    goBack,
    retry,
    canGoBack,
  };
}

export type { WizardContextValue, TierPriceRange };
