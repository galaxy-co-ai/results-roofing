'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for quote-related queries
 * Provides consistent cache key patterns
 */
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
};

/**
 * Quote estimate returned from API
 */
interface QuoteEstimate {
  id: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  estimate: {
    sqft: number;
    sqftRange: { min: number; max: number };
    confidence: string;
    tiers: TierPriceRange[];
  };
}

interface TierPriceRange {
  tierId: string;
  tierName: string;
  tier: string;
  priceMin: number;
  priceMax: number;
  priceEstimate: number;
}

interface CreateQuoteInput {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  phone?: string;
  smsConsent?: {
    consented: boolean;
    consentText: string;
    timestamp: string;
  };
}

interface SelectTierInput {
  quoteId: string;
  tierId: string;
}

/**
 * Fetches a quote by ID
 */
async function fetchQuote(id: string): Promise<QuoteEstimate> {
  const response = await fetch(`/api/quotes?id=${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quote');
  }
  return response.json();
}

/**
 * Creates a new quote from address
 */
async function createQuote(input: CreateQuoteInput): Promise<QuoteEstimate> {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create quote');
  }
  return response.json();
}

/**
 * Selects a tier for a quote
 */
async function selectTier(input: SelectTierInput): Promise<{ success: boolean; quoteId: string }> {
  const response = await fetch(`/api/quotes/${input.quoteId}/select-tier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tierId: input.tierId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to select tier');
  }
  return response.json();
}

/**
 * Input for finalizing checkout (consolidated API call)
 */
interface FinalizeCheckoutInput {
  quoteId: string;
  phone: string;
  smsConsent: boolean;
  scheduledDate: string;
  timeSlot: 'morning' | 'afternoon';
  timezone: string;
  financingTerm: 'pay-full' | '12' | '24';
}

/**
 * Response from finalize checkout
 */
interface FinalizeCheckoutResponse {
  success: boolean;
  quoteId: string;
  data: {
    scheduledDate: string;
    timeSlot: string;
    slotId: string;
    financingTerm: string;
    monthlyPayment: number | null;
  };
}

/**
 * Finalizes checkout with contact, schedule, and financing in a single call
 */
async function finalizeCheckout(input: FinalizeCheckoutInput): Promise<FinalizeCheckoutResponse> {
  const response = await fetch(`/api/quotes/${input.quoteId}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: input.phone,
      smsConsent: input.smsConsent,
      scheduledDate: input.scheduledDate,
      timeSlot: input.timeSlot,
      timezone: input.timezone,
      financingTerm: input.financingTerm,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to finalize checkout');
  }
  return response.json();
}

/**
 * Hook to fetch a quote by ID
 * 
 * @example
 * ```tsx
 * const { data: quote, isLoading, error } = useQuote('quote-123');
 * ```
 */
export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: quoteKeys.detail(id ?? ''),
    queryFn: () => fetchQuote(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook to create a new quote
 * 
 * @example
 * ```tsx
 * const createQuoteMutation = useCreateQuote();
 * 
 * const handleSubmit = async (address: CreateQuoteInput) => {
 *   const quote = await createQuoteMutation.mutateAsync(address);
 *   router.push(`/quote/${quote.id}/measuring`);
 * };
 * ```
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuote,
    onSuccess: (data) => {
      // Populate the cache with the new quote
      queryClient.setQueryData(quoteKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to select a tier for a quote
 * 
 * @example
 * ```tsx
 * const selectTierMutation = useSelectTier();
 * 
 * const handleSelect = async (tierId: string) => {
 *   await selectTierMutation.mutateAsync({ quoteId, tierId });
 *   router.push(`/quote/${quoteId}/checkout`);
 * };
 * ```
 */
export function useSelectTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selectTier,
    onSuccess: (data) => {
      // Invalidate quote to refetch with selected tier
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(data.quoteId) });
    },
  });
}

/**
 * Hook to finalize checkout with a single API call
 * Combines contact, schedule, and financing updates
 * 
 * @example
 * ```tsx
 * const finalizeMutation = useFinalizeCheckout();
 * 
 * const handleSubmit = async () => {
 *   await finalizeMutation.mutateAsync({
 *     quoteId,
 *     phone: '555-555-5555',
 *     smsConsent: true,
 *     scheduledDate: selectedDate.toISOString(),
 *     timeSlot: 'morning',
 *     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
 *     financingTerm: 'pay-full',
 *   });
 *   router.push(`/quote/${quoteId}/contract`);
 * };
 * ```
 */
export function useFinalizeCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finalizeCheckout,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: quoteKeys.detail(variables.quoteId) });

      // Snapshot the previous value
      const previousQuote = queryClient.getQueryData(quoteKeys.detail(variables.quoteId));

      // Optimistically update the cache with new status
      queryClient.setQueryData(quoteKeys.detail(variables.quoteId), (old: QuoteEstimate | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status: 'scheduled',
        };
      });

      // Return a context object with the snapshotted value
      return { previousQuote };
    },
    onError: (_err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQuote) {
        queryClient.setQueryData(quoteKeys.detail(variables.quoteId), context.previousQuote);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(variables.quoteId) });
    },
  });
}

export type { QuoteEstimate, CreateQuoteInput, SelectTierInput, TierPriceRange, FinalizeCheckoutInput };
