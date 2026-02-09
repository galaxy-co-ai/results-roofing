'use client';

import { Check, Star, Loader2 } from 'lucide-react';
import { QuoteStepper } from '../../QuoteStepper';
import styles from './Stage2.module.css';

interface TierData {
  tier: string;
  displayName: string;
  description: string;
  totalPrice: number;
  features: string[];
  isPopular?: boolean;
}

interface PackageSelectionProps {
  tiers: TierData[];
  sqft: number;
  address: string;
  selectedTier: 'good' | 'better' | 'best' | null;
  onSelect: (tier: 'good' | 'better' | 'best') => void;
  isLoading?: boolean;
  quoteId: string;
}

// Map tier keys to new display names
const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Preferred',
  best: 'Signature',
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Stage 2, Sub-step 1: Package Selection
 * 
 * User chooses between Essential, Preferred, or Signature packages.
 * Cards are expandable to show feature details.
 */
export function PackageSelection({
  tiers,
  sqft,
  address,
  selectedTier,
  onSelect,
  isLoading = false,
  quoteId,
}: PackageSelectionProps) {
  return (
    <div className={styles.subStep}>
      {/* Unified Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Choose Your Package</h1>
        <QuoteStepper currentStage={2} quoteId={quoteId} />
        <p className={styles.addressLine}>
          <span className={styles.addressLabel}>Quote for</span>
          <span className={styles.addressValue}>{address}</span>
        </p>
      </div>

      {/* Package Cards */}
      <div className={styles.tiersGrid}>
        {tiers.map((tier) => {
          const tierKey = tier.tier.toLowerCase() as 'good' | 'better' | 'best';
          const isSelected = selectedTier === tierKey;
          const isSelecting = isLoading && isSelected;
          const displayName = TIER_DISPLAY_NAMES[tierKey] || tier.displayName;

          return (
            <div
              key={tier.tier}
              className={`${styles.tierCard} ${tier.isPopular ? styles.tierCard_popular : ''} ${isSelected ? styles.tierCard_selected : ''}`}
            >
              {tier.isPopular && (
                <div className={styles.popularBadge}>
                  <Star size={14} aria-hidden="true" />
                  Most Popular
                </div>
              )}

              <div className={styles.tierHeader}>
                <h2 className={styles.tierName}>{displayName}</h2>
              </div>

              <div className={styles.priceSection}>
                <div className={styles.totalPrice}>
                  {formatPrice(tier.totalPrice)}
                </div>
                <div className={styles.pricePerSqft}>
                  {formatPrice(Math.round((tier.totalPrice / sqft) * 100) / 100)}/sq ft installed
                </div>
              </div>

              {/* Features List */}
              <ul className={styles.featuresList}>
                {tier.features.map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <Check size={16} className={styles.featureIcon} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onSelect(tierKey)}
                disabled={isLoading}
                className={`${styles.selectButton} ${tier.isPopular ? styles.selectButton_primary : ''}`}
                aria-pressed={isSelected}
              >
                {isSelecting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
                    Selecting...
                  </>
                ) : (
                  <>
                    {isSelected ? 'Selected' : `Select ${displayName}`}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className={styles.helpSection}>
        <p className={styles.helpText}>
          Not sure which to choose? Our Preferred package is the most popular choice, offering the
          best balance of quality and value.
        </p>
      </div>
    </div>
  );
}

export default PackageSelection;
