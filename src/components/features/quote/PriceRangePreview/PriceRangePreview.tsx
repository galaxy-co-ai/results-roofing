'use client';

import { ChevronRight, Loader2 } from 'lucide-react';
import type { PriceRangeResult } from '@/lib/pricing';
import styles from './PriceRangePreview.module.css';

interface PriceRangePreviewProps {
  priceRanges: PriceRangeResult[];
  onContinue: () => void;
  isLoading?: boolean;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getTierClassName(tier: string): string {
  const tierLower = tier.toLowerCase();
  if (tierLower === 'good' || tierLower.includes('good')) return styles.good;
  if (tierLower === 'better' || tierLower.includes('better')) return styles.better;
  if (tierLower === 'best' || tierLower.includes('best')) return styles.best;
  return '';
}

export function PriceRangePreview({
  priceRanges,
  onContinue,
  isLoading = false,
}: PriceRangePreviewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Estimated Price Range</h2>
        <p className={styles.subtitle}>
          Based on your property, here&apos;s what you can expect
        </p>
      </div>

      <div className={styles.tiers}>
        {priceRanges.map((tier) => (
          <div
            key={tier.tier}
            className={`${styles.tierCard} ${getTierClassName(tier.tier)}`}
          >
            <div className={styles.tierInfo}>
              <h3 className={styles.tierName}>{tier.displayName}</h3>
              <p className={styles.tierDescription}>{tier.description}</p>
            </div>
            <div className={styles.tierPrice}>
              <p className={styles.priceRange}>
                {formatPrice(tier.priceMin)} - {formatPrice(tier.priceMax)}
              </p>
              <p className={styles.priceLabel}>estimated total</p>
            </div>
          </div>
        ))}
      </div>

      <p className={styles.disclaimer}>
        Final pricing will be confirmed after you select your roofing package.
        No obligation, no salesperson visit required.
      </p>

      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            Loading...
          </>
        ) : (
          <>
            View Package Options
            <ChevronRight size={20} />
          </>
        )}
      </button>
    </div>
  );
}

export default PriceRangePreview;
