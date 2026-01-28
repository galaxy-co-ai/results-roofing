'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { ParsedAddress } from '@/components/features/address';
import type { PriceRangeResult } from '@/lib/pricing';

/**
 * Wizard stage definitions
 */
export type WizardStage = 1 | 2 | 3;

/**
 * Sub-steps within each stage
 */
export type Stage1SubStep = 'address' | 'property-confirm' | 'price-preview';
export type Stage2SubStep = 'package' | 'schedule' | 'financing';
export type Stage3SubStep = 'contact' | 'contract' | 'signature' | 'payment';

export type SubStep = Stage1SubStep | Stage2SubStep | Stage3SubStep;

/**
 * Stage configuration
 */
export const STAGE_CONFIG = {
  1: {
    label: 'Get Your Quote',
    subSteps: ['address', 'property-confirm', 'price-preview'] as Stage1SubStep[],
    path: '/quote/new',
  },
  2: {
    label: 'Customize',
    subSteps: ['package', 'schedule', 'financing'] as Stage2SubStep[],
    path: (quoteId: string) => `/quote/${quoteId}/customize`,
  },
  3: {
    label: 'Confirm & Pay',
    subSteps: ['contact', 'contract', 'signature', 'payment'] as Stage3SubStep[],
    path: (quoteId: string) => `/quote/${quoteId}/checkout`,
  },
} as const;

/**
 * Full wizard state
 */
export interface QuoteWizardState {
  // Current position in wizard
  currentStage: WizardStage;
  currentSubStep: SubStep;
  
  // Stage 1 data
  address: ParsedAddress | null;
  propertyConfirmed: boolean;
  quoteId: string | null;
  priceRanges: PriceRangeResult[] | null;
  
  // Stage 2 data
  selectedTier: 'good' | 'better' | 'best' | null;
  scheduledDate: Date | null;
  timeSlot: 'morning' | 'afternoon' | null;
  financingTerm: 'pay-full' | '12' | '24' | null;
  
  // Stage 3 data
  phone: string;
  smsConsent: boolean;
  contractAgreed: boolean;
  signatureText: string;
  
  // Meta
  isLoading: boolean;
  error: string | null;
  lastSavedAt: Date | null;
}

/**
 * Initial state
 */
const initialState: QuoteWizardState = {
  currentStage: 1,
  currentSubStep: 'address',
  address: null,
  propertyConfirmed: false,
  quoteId: null,
  priceRanges: null,
  selectedTier: null,
  scheduledDate: null,
  timeSlot: null,
  financingTerm: null,
  phone: '',
  smsConsent: false,
  contractAgreed: false,
  signatureText: '',
  isLoading: false,
  error: null,
  lastSavedAt: null,
};

/**
 * Action types for state machine
 */
type WizardAction =
  | { type: 'SET_ADDRESS'; payload: ParsedAddress }
  | { type: 'CONFIRM_PROPERTY' }
  | { type: 'SET_QUOTE_ID'; payload: string }
  | { type: 'SET_PRICE_RANGES'; payload: PriceRangeResult[] }
  | { type: 'SELECT_TIER'; payload: 'good' | 'better' | 'best' }
  | { type: 'SET_SCHEDULE'; payload: { date: Date; timeSlot: 'morning' | 'afternoon' } }
  | { type: 'SET_FINANCING'; payload: 'pay-full' | '12' | '24' }
  | { type: 'SET_CONTACT'; payload: { phone: string; smsConsent: boolean } }
  | { type: 'AGREE_TO_CONTRACT' }
  | { type: 'SET_SIGNATURE'; payload: string }
  | { type: 'GO_TO_SUB_STEP'; payload: SubStep }
  | { type: 'GO_TO_STAGE'; payload: { stage: WizardStage; subStep?: SubStep } }
  | { type: 'NEXT_SUB_STEP' }
  | { type: 'PREV_SUB_STEP' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<QuoteWizardState> };

/**
 * Get sub-steps for a stage
 */
function getSubStepsForStage(stage: WizardStage): SubStep[] {
  return STAGE_CONFIG[stage].subSteps as SubStep[];
}

/**
 * Get stage for a sub-step
 */
function getStageForSubStep(subStep: SubStep): WizardStage {
  for (const [stage, config] of Object.entries(STAGE_CONFIG)) {
    if ((config.subSteps as readonly SubStep[]).includes(subStep)) {
      return parseInt(stage) as WizardStage;
    }
  }
  return 1;
}

/**
 * Get next sub-step (across stages)
 */
function getNextSubStep(currentSubStep: SubStep): SubStep | null {
  const currentStage = getStageForSubStep(currentSubStep);
  const subSteps = getSubStepsForStage(currentStage);
  const currentIndex = subSteps.indexOf(currentSubStep);
  
  // Try next in current stage
  if (currentIndex < subSteps.length - 1) {
    return subSteps[currentIndex + 1];
  }
  
  // Try first of next stage
  if (currentStage < 3) {
    const nextStage = (currentStage + 1) as WizardStage;
    return getSubStepsForStage(nextStage)[0];
  }
  
  return null;
}

/**
 * Get previous sub-step (across stages)
 */
function getPrevSubStep(currentSubStep: SubStep): SubStep | null {
  const currentStage = getStageForSubStep(currentSubStep);
  const subSteps = getSubStepsForStage(currentStage);
  const currentIndex = subSteps.indexOf(currentSubStep);
  
  // Try previous in current stage
  if (currentIndex > 0) {
    return subSteps[currentIndex - 1];
  }
  
  // Try last of previous stage
  if (currentStage > 1) {
    const prevStage = (currentStage - 1) as WizardStage;
    const prevSubSteps = getSubStepsForStage(prevStage);
    return prevSubSteps[prevSubSteps.length - 1];
  }
  
  return null;
}

/**
 * State machine reducer
 */
function wizardReducer(state: QuoteWizardState, action: WizardAction): QuoteWizardState {
  switch (action.type) {
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.payload,
        error: null,
      };

    case 'CONFIRM_PROPERTY':
      return {
        ...state,
        propertyConfirmed: true,
      };

    case 'SET_QUOTE_ID':
      return {
        ...state,
        quoteId: action.payload,
      };

    case 'SET_PRICE_RANGES':
      return {
        ...state,
        priceRanges: action.payload,
        currentSubStep: 'price-preview',
      };

    case 'SELECT_TIER':
      return {
        ...state,
        selectedTier: action.payload,
      };

    case 'SET_SCHEDULE':
      return {
        ...state,
        scheduledDate: action.payload.date,
        timeSlot: action.payload.timeSlot,
      };

    case 'SET_FINANCING':
      return {
        ...state,
        financingTerm: action.payload,
      };

    case 'SET_CONTACT':
      return {
        ...state,
        phone: action.payload.phone,
        smsConsent: action.payload.smsConsent,
      };

    case 'AGREE_TO_CONTRACT':
      return {
        ...state,
        contractAgreed: true,
      };

    case 'SET_SIGNATURE':
      return {
        ...state,
        signatureText: action.payload,
      };

    case 'GO_TO_SUB_STEP': {
      const newStage = getStageForSubStep(action.payload);
      return {
        ...state,
        currentStage: newStage,
        currentSubStep: action.payload,
      };
    }

    case 'GO_TO_STAGE': {
      const firstSubStep = getSubStepsForStage(action.payload.stage)[0];
      return {
        ...state,
        currentStage: action.payload.stage,
        currentSubStep: action.payload.subStep ?? firstSubStep,
      };
    }

    case 'NEXT_SUB_STEP': {
      const nextStep = getNextSubStep(state.currentSubStep);
      if (!nextStep) return state;
      
      const nextStage = getStageForSubStep(nextStep);
      return {
        ...state,
        currentStage: nextStage,
        currentSubStep: nextStep,
      };
    }

    case 'PREV_SUB_STEP': {
      const prevStep = getPrevSubStep(state.currentSubStep);
      if (!prevStep) return state;
      
      const prevStage = getStageForSubStep(prevStep);
      return {
        ...state,
        currentStage: prevStage,
        currentSubStep: prevStep,
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'MARK_SAVED':
      return {
        ...state,
        lastSavedAt: new Date(),
      };

    case 'RESET':
      return initialState;

    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

/**
 * Context value type
 */
interface QuoteWizardContextValue {
  state: QuoteWizardState;
  
  // Navigation
  goToSubStep: (subStep: SubStep) => void;
  goToStage: (stage: WizardStage, subStep?: SubStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Stage 1 actions
  setAddress: (address: ParsedAddress) => void;
  confirmProperty: () => void;
  setQuoteId: (id: string) => void;
  setPriceRanges: (ranges: PriceRangeResult[]) => void;
  
  // Stage 2 actions
  selectTier: (tier: 'good' | 'better' | 'best') => void;
  setSchedule: (date: Date, timeSlot: 'morning' | 'afternoon') => void;
  setFinancing: (term: 'pay-full' | '12' | '24') => void;
  
  // Stage 3 actions
  setContact: (phone: string, smsConsent: boolean) => void;
  agreeToContract: () => void;
  setSignature: (signature: string) => void;
  
  // Meta actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markSaved: () => void;
  reset: () => void;
  hydrate: (data: Partial<QuoteWizardState>) => void;
  
  // Computed helpers
  canGoBack: boolean;
  canGoNext: boolean;
  isStageComplete: (stage: WizardStage) => boolean;
  getSubStepIndex: () => { current: number; total: number };
}

const QuoteWizardContext = createContext<QuoteWizardContextValue | null>(null);

/**
 * Provider component
 */
interface QuoteWizardProviderProps {
  children: ReactNode;
  initialData?: Partial<QuoteWizardState>;
}

export function QuoteWizardProvider({ children, initialData }: QuoteWizardProviderProps) {
  const [state, dispatch] = useReducer(
    wizardReducer,
    initialData ? { ...initialState, ...initialData } : initialState
  );

  // Navigation
  const goToSubStep = useCallback((subStep: SubStep) => {
    dispatch({ type: 'GO_TO_SUB_STEP', payload: subStep });
  }, []);

  const goToStage = useCallback((stage: WizardStage, subStep?: SubStep) => {
    dispatch({ type: 'GO_TO_STAGE', payload: { stage, subStep } });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_SUB_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_SUB_STEP' });
  }, []);

  // Stage 1 actions
  const setAddress = useCallback((address: ParsedAddress) => {
    dispatch({ type: 'SET_ADDRESS', payload: address });
  }, []);

  const confirmProperty = useCallback(() => {
    dispatch({ type: 'CONFIRM_PROPERTY' });
  }, []);

  const setQuoteId = useCallback((id: string) => {
    dispatch({ type: 'SET_QUOTE_ID', payload: id });
  }, []);

  const setPriceRanges = useCallback((ranges: PriceRangeResult[]) => {
    dispatch({ type: 'SET_PRICE_RANGES', payload: ranges });
  }, []);

  // Stage 2 actions
  const selectTier = useCallback((tier: 'good' | 'better' | 'best') => {
    dispatch({ type: 'SELECT_TIER', payload: tier });
  }, []);

  const setSchedule = useCallback((date: Date, timeSlot: 'morning' | 'afternoon') => {
    dispatch({ type: 'SET_SCHEDULE', payload: { date, timeSlot } });
  }, []);

  const setFinancing = useCallback((term: 'pay-full' | '12' | '24') => {
    dispatch({ type: 'SET_FINANCING', payload: term });
  }, []);

  // Stage 3 actions
  const setContact = useCallback((phone: string, smsConsent: boolean) => {
    dispatch({ type: 'SET_CONTACT', payload: { phone, smsConsent } });
  }, []);

  const agreeToContract = useCallback(() => {
    dispatch({ type: 'AGREE_TO_CONTRACT' });
  }, []);

  const setSignature = useCallback((signature: string) => {
    dispatch({ type: 'SET_SIGNATURE', payload: signature });
  }, []);

  // Meta actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const hydrate = useCallback((data: Partial<QuoteWizardState>) => {
    dispatch({ type: 'HYDRATE', payload: data });
  }, []);

  // Computed helpers
  const canGoBack = useMemo(() => {
    return getPrevSubStep(state.currentSubStep) !== null;
  }, [state.currentSubStep]);

  const canGoNext = useMemo(() => {
    return getNextSubStep(state.currentSubStep) !== null;
  }, [state.currentSubStep]);

  const isStageComplete = useCallback((stage: WizardStage): boolean => {
    switch (stage) {
      case 1:
        return !!state.quoteId && !!state.priceRanges;
      case 2:
        return !!state.selectedTier && !!state.scheduledDate && !!state.financingTerm;
      case 3:
        return !!state.phone && state.contractAgreed && !!state.signatureText;
      default:
        return false;
    }
  }, [state]);

  const getSubStepIndex = useCallback((): { current: number; total: number } => {
    const subSteps = getSubStepsForStage(state.currentStage);
    const current = subSteps.indexOf(state.currentSubStep) + 1;
    return { current, total: subSteps.length };
  }, [state.currentStage, state.currentSubStep]);

  const value = useMemo(
    () => ({
      state,
      goToSubStep,
      goToStage,
      nextStep,
      prevStep,
      setAddress,
      confirmProperty,
      setQuoteId,
      setPriceRanges,
      selectTier,
      setSchedule,
      setFinancing,
      setContact,
      agreeToContract,
      setSignature,
      setLoading,
      setError,
      markSaved,
      reset,
      hydrate,
      canGoBack,
      canGoNext,
      isStageComplete,
      getSubStepIndex,
    }),
    [
      state,
      goToSubStep,
      goToStage,
      nextStep,
      prevStep,
      setAddress,
      confirmProperty,
      setQuoteId,
      setPriceRanges,
      selectTier,
      setSchedule,
      setFinancing,
      setContact,
      agreeToContract,
      setSignature,
      setLoading,
      setError,
      markSaved,
      reset,
      hydrate,
      canGoBack,
      canGoNext,
      isStageComplete,
      getSubStepIndex,
    ]
  );

  return (
    <QuoteWizardContext.Provider value={value}>
      {children}
    </QuoteWizardContext.Provider>
  );
}

/**
 * Hook to use wizard context
 */
export function useQuoteWizard() {
  const context = useContext(QuoteWizardContext);
  if (!context) {
    throw new Error('useQuoteWizard must be used within a QuoteWizardProvider');
  }
  return context;
}

export { getSubStepsForStage, getStageForSubStep, getNextSubStep, getPrevSubStep };
