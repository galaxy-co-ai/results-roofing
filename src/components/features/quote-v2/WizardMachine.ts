import { setup, assign, fromPromise } from 'xstate';
import type { ParsedAddress } from '@/components/features/address';

/**
 * Wizard Stage types
 */
export type WizardStage = 'property' | 'package' | 'checkout';

/**
 * Tier price range from API
 */
export interface TierPriceRange {
  tierId: string;
  tierName: string;
  tier: 'good' | 'better' | 'best';
  priceMin: number;
  priceMax: number;
  priceEstimate: number;
}

/**
 * Wizard context - all data collected through the flow
 */
export interface WizardContext {
  // Quote ID
  quoteId: string | null;

  // Stage 1: Property
  address: ParsedAddress | null;
  propertyConfirmed: boolean;
  sqftEstimate: number | null;
  priceRanges: TierPriceRange[] | null;

  // Stage 2: Package
  selectedTier: 'good' | 'better' | 'best' | null;
  selectedTierId: string | null;

  // Stage 3: Checkout
  scheduledDate: Date | null;
  timeSlot: 'morning' | 'afternoon' | null;
  phone: string;
  email: string;
  smsConsent: boolean;

  // Payment
  paymentIntentId: string | null;
  paymentStatus: 'idle' | 'processing' | 'succeeded' | 'failed';

  // Meta
  error: string | null;
  navigationDirection: 'forward' | 'backward';
}

/**
 * Event types for the wizard
 */
export type WizardEvent =
  | { type: 'SET_ADDRESS'; address: ParsedAddress }
  | { type: 'CONFIRM_PROPERTY' }
  | { type: 'QUOTE_CREATED'; quoteId: string; sqftEstimate: number; priceRanges: TierPriceRange[] }
  | { type: 'SELECT_TIER'; tier: 'good' | 'better' | 'best'; tierId: string }
  | { type: 'TIER_SAVED' }
  | { type: 'SET_SCHEDULE'; date: Date; timeSlot: 'morning' | 'afternoon' }
  | { type: 'SET_CONTACT'; phone: string; email: string; smsConsent: boolean }
  | { type: 'SUBMIT_CONTACT' }
  | { type: 'FINALIZED' }
  | { type: 'PAYMENT_STARTED'; paymentIntentId: string }
  | { type: 'PAYMENT_SUCCEEDED' }
  | { type: 'PAYMENT_FAILED'; error: string }
  | { type: 'BACK' }
  | { type: 'RETRY' }
  | { type: 'ERROR'; error: string }
  | { type: 'HYDRATE'; data: Partial<WizardContext>; state?: string }
  | { type: 'RESTORE_TO'; state: string };

/**
 * Initial context
 */
const initialContext: WizardContext = {
  quoteId: null,
  address: null,
  propertyConfirmed: false,
  sqftEstimate: null,
  priceRanges: null,
  selectedTier: null,
  selectedTierId: null,
  scheduledDate: null,
  timeSlot: null,
  phone: '',
  email: '',
  smsConsent: false,
  paymentIntentId: null,
  paymentStatus: 'idle',
  error: null,
  navigationDirection: 'forward',
};

/**
 * Actor for creating a quote via API
 */
const createQuoteActor = fromPromise<
  { quoteId: string; sqftEstimate: number; priceRanges: TierPriceRange[] },
  { address: ParsedAddress }
>(async ({ input }) => {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streetAddress: input.address.streetAddress,
      city: input.address.city,
      state: input.address.state,
      zip: input.address.zip,
      lat: input.address.lat,
      lng: input.address.lng,
      placeId: input.address.placeId,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create quote');
  }

  const data = await response.json();
  return {
    quoteId: data.id,
    sqftEstimate: data.estimate?.sqft || 0,
    priceRanges: data.estimate?.tiers || [],
  };
});

/**
 * Actor for selecting a tier via API
 */
const selectTierActor = fromPromise<
  { success: boolean },
  { quoteId: string; tierId: string }
>(async ({ input }) => {
  const response = await fetch(`/api/quotes/${input.quoteId}/select-tier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tierId: input.tierId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to select tier');
  }

  return { success: true };
});

/**
 * Actor for finalizing checkout
 */
const finalizeCheckoutActor = fromPromise<
  { success: boolean },
  { quoteId: string; phone: string; email: string; smsConsent: boolean; scheduledDate: Date; timeSlot: string }
>(async ({ input }) => {
  const response = await fetch(`/api/quotes/${input.quoteId}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: input.phone,
      email: input.email,
      smsConsent: input.smsConsent,
      scheduledDate: input.scheduledDate.toISOString(),
      timeSlot: input.timeSlot,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      financingTerm: 'pay-full', // Default for v2 wizard
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to finalize checkout');
  }

  return { success: true };
});

/**
 * Quote Wizard V2 State Machine
 *
 * Three stages, eight states:
 * PROPERTY (Stage 1): address → creatingQuote → confirm
 * PACKAGE (Stage 2): select → savingTier
 * CHECKOUT (Stage 3): schedule → contact → finalizing → payment → success
 */
export const wizardMachine = setup({
  types: {
    context: {} as WizardContext,
    events: {} as WizardEvent,
  },
  actors: {
    createQuote: createQuoteActor,
    selectTier: selectTierActor,
    finalizeCheckout: finalizeCheckoutActor,
  },
  actions: {
    setAddress: assign({
      address: ({ event }) => {
        if (event.type === 'SET_ADDRESS') return event.address;
        return null;
      },
      error: null,
      navigationDirection: 'forward',
    }),
    confirmProperty: assign({
      propertyConfirmed: true,
      navigationDirection: 'forward',
    }),
    setQuoteData: assign({
      quoteId: ({ event }) => {
        if (event.type === 'QUOTE_CREATED') return event.quoteId;
        return null;
      },
      sqftEstimate: ({ event }) => {
        if (event.type === 'QUOTE_CREATED') return event.sqftEstimate;
        return null;
      },
      priceRanges: ({ event }) => {
        if (event.type === 'QUOTE_CREATED') return event.priceRanges;
        return null;
      },
    }),
    selectTier: assign({
      selectedTier: ({ event }) => {
        if (event.type === 'SELECT_TIER') return event.tier;
        return null;
      },
      selectedTierId: ({ event }) => {
        if (event.type === 'SELECT_TIER') return event.tierId;
        return null;
      },
      navigationDirection: 'forward',
    }),
    setSchedule: assign({
      scheduledDate: ({ event }) => {
        if (event.type === 'SET_SCHEDULE') return event.date;
        return null;
      },
      timeSlot: ({ event }) => {
        if (event.type === 'SET_SCHEDULE') return event.timeSlot;
        return null;
      },
      navigationDirection: 'forward',
    }),
    setContact: assign({
      phone: ({ event }) => {
        if (event.type === 'SET_CONTACT') return event.phone;
        return '';
      },
      email: ({ event }) => {
        if (event.type === 'SET_CONTACT') return event.email;
        return '';
      },
      smsConsent: ({ event }) => {
        if (event.type === 'SET_CONTACT') return event.smsConsent;
        return false;
      },
    }),
    setPaymentStarted: assign({
      paymentIntentId: ({ event }) => {
        if (event.type === 'PAYMENT_STARTED') return event.paymentIntentId;
        return null;
      },
      paymentStatus: 'processing',
    }),
    setPaymentSucceeded: assign({
      paymentStatus: 'succeeded',
    }),
    setPaymentFailed: assign({
      paymentStatus: 'failed',
      error: ({ event }) => {
        if (event.type === 'PAYMENT_FAILED') return event.error;
        return 'Payment failed';
      },
    }),
    setError: assign({
      error: ({ event }) => {
        if (event.type === 'ERROR') return event.error;
        return 'An error occurred';
      },
    }),
    clearError: assign({
      error: null,
    }),
    goBack: assign({
      navigationDirection: 'backward',
      error: null,
    }),
    hydrateContext: assign(({ event, context }) => {
      if (event.type === 'HYDRATE') {
        return { ...context, ...event.data };
      }
      return context;
    }),
  },
  guards: {
    hasAddress: ({ context }) => context.address !== null,
    hasQuote: ({ context }) => context.quoteId !== null,
    hasTier: ({ context }) => context.selectedTier !== null,
    hasSchedule: ({ context }) => context.scheduledDate !== null && context.timeSlot !== null,
    hasContact: ({ context }) => context.phone.length > 0 && context.email.length > 0,
  },
}).createMachine({
  id: 'quoteWizard',
  initial: 'address',
  context: initialContext,
  states: {
    // ============ PROPERTY STAGE ============
    address: {
      meta: { stage: 'property', label: 'Enter Address' },
      on: {
        SET_ADDRESS: {
          actions: 'setAddress',
        },
        CONFIRM_PROPERTY: {
          target: 'creatingQuote',
          guard: 'hasAddress',
          actions: 'confirmProperty',
        },
        // HYDRATE can restore context and optionally transition to a target state
        HYDRATE: [
          { target: 'confirm', guard: ({ event }) => event.type === 'HYDRATE' && event.state === 'confirm', actions: 'hydrateContext' },
          { target: 'select', guard: ({ event }) => event.type === 'HYDRATE' && event.state === 'select', actions: 'hydrateContext' },
          { target: 'schedule', guard: ({ event }) => event.type === 'HYDRATE' && event.state === 'schedule', actions: 'hydrateContext' },
          { target: 'contact', guard: ({ event }) => event.type === 'HYDRATE' && event.state === 'contact', actions: 'hydrateContext' },
          { target: 'payment', guard: ({ event }) => event.type === 'HYDRATE' && event.state === 'payment', actions: 'hydrateContext' },
          { target: 'success', guard: ({ event }) => event.type === 'HYDRATE' && event.state === 'success', actions: 'hydrateContext' },
          { actions: 'hydrateContext' }, // Default: just update context, stay in address
        ],
      },
    },
    creatingQuote: {
      meta: { stage: 'property', label: 'Creating Quote' },
      invoke: {
        src: 'createQuote',
        input: ({ context }) => ({ address: context.address! }),
        onDone: {
          target: 'confirm',
          actions: assign({
            quoteId: ({ event }) => event.output.quoteId,
            sqftEstimate: ({ event }) => event.output.sqftEstimate,
            priceRanges: ({ event }) => event.output.priceRanges,
          }),
        },
        onError: {
          target: 'address',
          actions: assign({
            error: ({ event }) => {
              const err = event.error as Error;
              return err.message || 'Failed to create quote';
            },
          }),
        },
      },
    },
    confirm: {
      meta: { stage: 'property', label: 'Confirm Property' },
      on: {
        BACK: {
          target: 'address',
          actions: 'goBack',
        },
        SELECT_TIER: {
          target: 'savingTier',
          actions: 'selectTier',
        },
        HYDRATE: {
          actions: 'hydrateContext',
        },
      },
    },

    // ============ PACKAGE STAGE ============
    select: {
      meta: { stage: 'package', label: 'Select Package' },
      on: {
        BACK: {
          target: 'confirm',
          actions: 'goBack',
        },
        SELECT_TIER: {
          target: 'savingTier',
          actions: 'selectTier',
        },
        HYDRATE: {
          actions: 'hydrateContext',
        },
      },
    },
    savingTier: {
      meta: { stage: 'package', label: 'Saving Selection' },
      invoke: {
        src: 'selectTier',
        input: ({ context }) => ({
          quoteId: context.quoteId!,
          tierId: context.selectedTierId!,
        }),
        onDone: {
          target: 'schedule',
        },
        onError: {
          target: 'select',
          actions: assign({
            error: ({ event }) => {
              const err = event.error as Error;
              return err.message || 'Failed to save tier selection';
            },
            selectedTier: null,
            selectedTierId: null,
          }),
        },
      },
    },

    // ============ CHECKOUT STAGE ============
    schedule: {
      meta: { stage: 'checkout', label: 'Schedule Inspection' },
      on: {
        BACK: {
          target: 'select',
          actions: 'goBack',
        },
        SET_SCHEDULE: {
          target: 'contact',
          actions: 'setSchedule',
        },
        HYDRATE: {
          actions: 'hydrateContext',
        },
      },
    },
    contact: {
      meta: { stage: 'checkout', label: 'Contact Info' },
      on: {
        BACK: {
          target: 'schedule',
          actions: 'goBack',
        },
        SET_CONTACT: {
          actions: 'setContact',
        },
        SUBMIT_CONTACT: {
          target: 'finalizing',
          guard: 'hasContact',
        },
        HYDRATE: {
          actions: 'hydrateContext',
        },
      },
    },
    finalizing: {
      meta: { stage: 'checkout', label: 'Processing' },
      invoke: {
        src: 'finalizeCheckout',
        input: ({ context }) => ({
          quoteId: context.quoteId!,
          phone: context.phone,
          email: context.email,
          smsConsent: context.smsConsent,
          scheduledDate: context.scheduledDate!,
          timeSlot: context.timeSlot!,
        }),
        onDone: {
          target: 'payment',
        },
        onError: {
          target: 'contact',
          actions: assign({
            error: ({ event }) => {
              const err = event.error as Error;
              return err.message || 'Failed to finalize checkout';
            },
          }),
        },
      },
    },
    payment: {
      meta: { stage: 'checkout', label: 'Payment' },
      on: {
        BACK: {
          target: 'contact',
          actions: 'goBack',
        },
        PAYMENT_STARTED: {
          actions: 'setPaymentStarted',
        },
        PAYMENT_SUCCEEDED: {
          target: 'success',
          actions: 'setPaymentSucceeded',
        },
        PAYMENT_FAILED: {
          actions: 'setPaymentFailed',
        },
        RETRY: {
          actions: assign({
            paymentStatus: 'idle',
            error: null,
          }),
        },
        HYDRATE: {
          actions: 'hydrateContext',
        },
      },
    },
    success: {
      meta: { stage: 'checkout', label: 'Confirmed' },
      type: 'final',
    },
  },
});

/**
 * Get the current stage from machine state
 */
export function getStageFromState(stateValue: string): WizardStage {
  const propertyStates = ['address', 'creatingQuote', 'confirm'];
  const packageStates = ['select', 'savingTier'];

  if (propertyStates.includes(stateValue)) return 'property';
  if (packageStates.includes(stateValue)) return 'package';
  return 'checkout';
}

/**
 * Get progress percentage for the wizard
 */
export function getProgressPercentage(stateValue: string): number {
  const stateProgress: Record<string, number> = {
    address: 0,
    creatingQuote: 10,
    confirm: 15,
    select: 30,
    savingTier: 40,
    schedule: 50,
    contact: 65,
    finalizing: 75,
    payment: 85,
    success: 100,
  };
  return stateProgress[stateValue] ?? 0;
}

/**
 * Get step number within current stage (for display)
 */
export function getStepInfo(stateValue: string): { step: number; total: number; label: string } {
  const stageSteps: Record<WizardStage, { states: string[]; labels: string[] }> = {
    property: {
      states: ['address', 'creatingQuote', 'confirm'],
      labels: ['Enter Address', 'Creating Quote', 'Confirm Property'],
    },
    package: {
      states: ['select', 'savingTier'],
      labels: ['Select Package', 'Saving'],
    },
    checkout: {
      states: ['schedule', 'contact', 'finalizing', 'payment', 'success'],
      labels: ['Schedule', 'Contact', 'Processing', 'Payment', 'Confirmed'],
    },
  };

  const stage = getStageFromState(stateValue);
  const config = stageSteps[stage];
  const index = config.states.indexOf(stateValue);

  return {
    step: index + 1,
    total: config.states.length,
    label: config.labels[index] || stateValue,
  };
}

export type { WizardContext as WizardContextType };
