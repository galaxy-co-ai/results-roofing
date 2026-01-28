'use client';

import { ChevronRight, Loader2, Bookmark } from 'lucide-react';
import type { PriceRangeResult } from '@/lib/pricing';
import styles from './Stage1.module.css';

interface PricePreviewProps {
  priceRanges: PriceRangeResult[];
  onContinue: () => void;
  onSaveQuote?: () => void;
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
  if (tierLower === 'good' || tierLower.includes('good')) return styles.tierGood;
  if (tierLower === 'better' || tierLower.includes('better')) return styles.tierBetter;
  if (tierLower === 'best' || tierLower.includes('best')) return styles.tierBest;
  return '';
}

/**
 * Stage 1, Sub-step 3: Price Preview
 * 
 * Shows estimated price ranges for each tier.
 * Offers option to save quote for later.
 */
export function PricePreview({
  priceRanges,
  onContinue,
  onSaveQuote,
  isLoading = false,
}: PricePreviewProps) {
  return (
    <div className={styles.subStep}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Your Estimated Price Range</h2>
        <p className={styles.subtitle}>
          Based on your property, here&apos;s what you can expect
        </p>
      </div>

      {/* Price Range Cards */}
      <div className={styles.tiersContainer}>
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

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        Final pricing will be confirmed after you select your roofing package.
        No obligation, no salesperson visit required.
      </p>

      {/* Actions */}
      <div className={styles.actionsVertical}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
              Loading...
            </>
          ) : (
            <>
              View Package Options
              <ChevronRight size={20} aria-hidden="true" />
            </>
          )}
        </button>

        {onSaveQuote && (
          <button
            type="button"
            className={styles.textButton}
            onClick={onSaveQuote}
            disabled={isLoading}
          >
            <Bookmark size={18} aria-hidden="true" />
            Save My Quote for Later
          </button>
        )}
      </div>
    </div>
  );
}

export default PricePreview;
