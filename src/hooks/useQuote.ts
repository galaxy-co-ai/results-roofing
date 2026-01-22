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

export type { QuoteEstimate, CreateQuoteInput, SelectTierInput, TierPriceRange };
