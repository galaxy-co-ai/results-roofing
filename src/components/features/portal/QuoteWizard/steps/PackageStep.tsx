'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { PackageTierCard } from '@/components/features/quote/PackageTierCard/PackageTierCard';
import { usePricingTiers, calculateTierPrice, getTierDisplayName } from '@/hooks/usePricingTiers';
import type { PackageTier } from '@/lib/constants';
import styles from '../QuoteWizard.module.css';

interface PackageStepProps {
  quoteId: string;
  estimate: {
    sqft: number;
    sqftRange: { min: number; max: number };
    tiers: Array<{ tier: string; minPrice: number; maxPrice: number }>;
  } | null;
  onNext: () => void;
}

export function PackageStep({ quoteId, estimate, onNext }: PackageStepProps) {
  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: pricingTiers, isLoading: tiersLoading } = usePricingTiers();

  // Poll for measurement completion (updates quote with firm sqft)
  const { data: quoteData } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      const res = await fetch(`/api/quotes?id=${quoteId}`);
      if (!res.ok) throw new Error('Failed to fetch quote');
      return res.json();
    },
    refetchInterval: (query) => {
      if (query.state.data?.status !== 'preliminary') return false;
      return 5000;
    },
  });

  const hasMeasurement = quoteData?.status !== 'preliminary' && quoteData?.sqftTotal;

  async function handleSelect(tier: PackageTier) {
    setSelectedTier(tier);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/select-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to select package');
      }

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (tiersLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--rr-color-text-tertiary)' }} />
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.tierGrid}>
        {pricingTiers?.map((tier) => {
          const estimateTier = estimate?.tiers.find(t => t.tier === tier.tier);
          const firmPrice = hasMeasurement ? calculateTierPrice(tier, quoteData.sqftTotal) : null;
          const price = firmPrice
            ? firmPrice
            : estimateTier
            ? { min: estimateTier.minPrice, max: estimateTier.maxPrice }
            : 0;

          return (
            <PackageTierCard
              key={tier.id}
              tier={tier.tier}
              name={getTierDisplayName(tier.tier)}
              price={price}
              features={tier.features.map(f => ({ label: f, value: '' }))}
              warranty={`${tier.warrantyYears}-Year ${tier.warrantyType}`}
              recommended={tier.isPopular}
              selected={selectedTier === tier.tier}
              onSelect={() => handleSelect(tier.tier)}
            />
          );
        })}
      </div>

      {!hasMeasurement && (
        <p style={{ fontSize: 13, color: 'var(--rr-color-text-tertiary)', margin: 0 }}>
          Prices shown are estimates. Final pricing will be confirmed once satellite analysis completes.
        </p>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
