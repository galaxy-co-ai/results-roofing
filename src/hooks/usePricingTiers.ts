'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Query key factory for pricing-related queries
 */
export const pricingKeys = {
  all: ['pricing'] as const,
  tiers: () => [...pricingKeys.all, 'tiers'] as const,
};

/**
 * Pricing tier as returned from the database
 */
interface PricingTier {
  id: string;
  name: string;
  tier: 'good' | 'better' | 'best';
  description: string | null;
  materialCostPerSqft: string;
  laborCostPerSqft: string;
  warrantyYears: number;
  warrantyType: string;
  shingleType: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Fetch pricing tiers from the database
 */
async function fetchPricingTiers(): Promise<PricingTier[]> {
  const response = await fetch('/api/pricing-tiers');
  if (!response.ok) {
    throw new Error('Failed to fetch pricing tiers');
  }
  return response.json();
}

/**
 * Hook to fetch all active pricing tiers
 * Caches for 1 hour since pricing rarely changes
 * 
 * @example
 * ```tsx
 * const { data: tiers, isLoading } = usePricingTiers();
 * 
 * if (isLoading) return <Skeleton />;
 * 
 * return (
 *   <div>
 *     {tiers?.map(tier => (
 *       <PackageTierCard key={tier.id} tier={tier} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePricingTiers() {
  return useQuery({
    queryKey: pricingKeys.tiers(),
    queryFn: fetchPricingTiers,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
  });
}

/**
 * Calculate price for a specific tier given square footage
 */
export function calculateTierPrice(tier: PricingTier, sqft: number): number {
  const materialCost = parseFloat(tier.materialCostPerSqft) * sqft;
  const laborCost = parseFloat(tier.laborCostPerSqft) * sqft;
  return Math.round(materialCost + laborCost);
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: PricingTier['tier']): string {
  const names: Record<typeof tier, string> = {
    good: 'Essential',
    better: 'Premium',
    best: 'Elite',
  };
  return names[tier];
}

export type { PricingTier };
