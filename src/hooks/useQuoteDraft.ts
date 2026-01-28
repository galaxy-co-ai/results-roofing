'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { QuoteDraftState } from '@/types';

/**
 * Local storage key for quote draft
 */
const DRAFT_STORAGE_KEY = 'rr_quote_draft';

/**
 * Input for saving a quote draft
 */
interface SaveDraftInput {
  quoteId: string;
  email: string;
  draftState: QuoteDraftState;
}

/**
 * Response from save draft API
 */
interface SaveDraftResponse {
  success: boolean;
  message: string;
  resumeUrl: string;
}

/**
 * Saves a quote draft to the server
 */
async function saveDraftToServer(input: SaveDraftInput): Promise<SaveDraftResponse> {
  const response = await fetch(`/api/quotes/${input.quoteId}/save-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      draftState: input.draftState,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save quote');
  }

  return response.json();
}

/**
 * Hook for managing quote draft state
 * Provides both local storage persistence and server-side save/resume
 * 
 * @example
 * ```tsx
 * const { draftState, updateDraft, saveDraft, isLoading } = useQuoteDraft(quoteId);
 * 
 * // Update local draft as user progresses
 * updateDraft({ selectedTier: 'better' });
 * 
 * // Save to server when user wants to resume later
 * await saveDraft('user@example.com');
 * ```
 */
export function useQuoteDraft(quoteId: string | undefined) {
  const [draftState, setDraftState] = useState<QuoteDraftState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load draft from local storage on mount
  useEffect(() => {
    if (!quoteId) return;

    const storageKey = `${DRAFT_STORAGE_KEY}_${quoteId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QuoteDraftState;
        setDraftState(parsed);
      } catch {
        // Invalid stored data, start fresh
        localStorage.removeItem(storageKey);
      }
    }

    setIsInitialized(true);
  }, [quoteId]);

  // Update draft in local storage
  const updateDraft = useCallback(
    (updates: Partial<QuoteDraftState>) => {
      if (!quoteId) return;

      setDraftState((prev) => {
        const newState: QuoteDraftState = {
          ...(prev || { currentStage: 1, currentStep: 1, lastUpdatedAt: new Date().toISOString() }),
          ...updates,
          lastUpdatedAt: new Date().toISOString(),
        };

        // Persist to local storage
        const storageKey = `${DRAFT_STORAGE_KEY}_${quoteId}`;
        localStorage.setItem(storageKey, JSON.stringify(newState));

        return newState;
      });
    },
    [quoteId]
  );

  // Clear draft from local storage
  const clearDraft = useCallback(() => {
    if (!quoteId) return;

    const storageKey = `${DRAFT_STORAGE_KEY}_${quoteId}`;
    localStorage.removeItem(storageKey);
    setDraftState(null);
  }, [quoteId]);

  // Server-side save mutation
  const saveMutation = useMutation({
    mutationFn: saveDraftToServer,
    onSuccess: () => {
      // Keep local draft for continued editing
    },
  });

  // Save draft to server with email
  const saveDraft = useCallback(
    async (email: string) => {
      if (!quoteId || !draftState) {
        throw new Error('No quote or draft state to save');
      }

      return saveMutation.mutateAsync({
        quoteId,
        email,
        draftState,
      });
    },
    [quoteId, draftState, saveMutation]
  );

  return {
    draftState,
    isInitialized,
    updateDraft,
    clearDraft,
    saveDraft,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    saveSuccess: saveMutation.isSuccess,
  };
}

export type { SaveDraftInput, SaveDraftResponse };
