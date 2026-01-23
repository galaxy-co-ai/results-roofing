'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type FeedbackReason = 'bug' | 'suggestion' | 'general';

export interface FeedbackData {
  reason: FeedbackReason | null;
  subOption: string | null;
  customReason: string;
  notes: string;
  timestamp: Date;
  currentPage: string;
  userAgent: string;
}

interface FeedbackContextType {
  isOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
  toggleFeedback: () => void;
  step: number;
  setStep: (step: number) => void;
  feedbackData: FeedbackData;
  setReason: (reason: FeedbackReason) => void;
  setSubOption: (option: string) => void;
  setCustomReason: (reason: string) => void;
  setNotes: (notes: string) => void;
  submitFeedback: () => Promise<void>;
  resetFeedback: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const initialFeedbackData: FeedbackData = {
  reason: null,
  subOption: null,
  customReason: '',
  notes: '',
  timestamp: new Date(),
  currentPage: '',
  userAgent: '',
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(initialFeedbackData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const openFeedback = useCallback(() => {
    // Capture current page, timestamp, and user agent when opening
    setFeedbackData((prev) => ({
      ...prev,
      timestamp: new Date(),
      currentPage: typeof window !== 'undefined' ? window.location.pathname : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }));
    setIsOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
    // Reset feedback state after close animation completes
    // so the experience starts fresh when reopened
    setTimeout(() => {
      setFeedbackData(initialFeedbackData);
      setStep(1);
      setIsSubmitted(false);
    }, 300);
  }, []);

  const toggleFeedback = useCallback(() => {
    if (isOpen) {
      closeFeedback();
    } else {
      openFeedback();
    }
  }, [isOpen, closeFeedback, openFeedback]);

  const setReason = useCallback((reason: FeedbackReason) => {
    setFeedbackData((prev) => ({ ...prev, reason, subOption: null }));
  }, []);

  const setSubOption = useCallback((option: string) => {
    setFeedbackData((prev) => ({ ...prev, subOption: option }));
  }, []);

  const setCustomReason = useCallback((customReason: string) => {
    setFeedbackData((prev) => ({ ...prev, customReason }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setFeedbackData((prev) => ({ ...prev, notes }));
  }, []);

  const resetFeedback = useCallback(() => {
    setFeedbackData(initialFeedbackData);
    setStep(1);
    setIsSubmitted(false);
  }, []);

  const submitFeedback = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Submit to API
      const response = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: feedbackData.reason,
          subOption: feedbackData.subOption,
          customReason: feedbackData.customReason || undefined,
          notes: feedbackData.notes || undefined,
          page: feedbackData.currentPage || '/',
          userAgent: feedbackData.userAgent || undefined,
          timestamp: feedbackData.timestamp.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        closeFeedback();
        // Reset after close animation completes
        setTimeout(resetFeedback, 300);
      }, 2000);
    } catch {
      // Handle error silently for now
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackData, closeFeedback, resetFeedback]);

  return (
    <FeedbackContext.Provider
      value={{
        isOpen,
        openFeedback,
        closeFeedback,
        toggleFeedback,
        step,
        setStep,
        feedbackData,
        setReason,
        setSubOption,
        setCustomReason,
        setNotes,
        submitFeedback,
        resetFeedback,
        isSubmitting,
        isSubmitted,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
