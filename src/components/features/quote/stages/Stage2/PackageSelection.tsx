'use client';

import { Check, Star, Clock, Loader2 } from 'lucide-react';
import { DEPOSIT_CONFIG, QUOTE_VALIDITY } from '@/lib/constants';
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
}

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
 * User chooses between Good, Better, or Best packages.
 */
export function PackageSelection({
  tiers,
  sqft,
  address,
  selectedTier,
  onSelect,
  isLoading = false,
}: PackageSelectionProps) {
  const depositPercent = DEPOSIT_CONFIG.percentage * 100;

  return (
    <div className={styles.subStep}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Package</h1>
        <p className={styles.subtitle}>
          Based on your {sqft.toLocaleString()} sq ft roof. All packages include professional
          installation, permits, and full cleanup.
        </p>
      </div>

      {/* Urgency message */}
      <div className={styles.urgencyBanner}>
        <Clock size={16} aria-hidden="true" />
        <span>Pricing valid for {QUOTE_VALIDITY.validityDays} days</span>
      </div>

      {/* Address Bar */}
      <div className={styles.addressBar}>
        <span className={styles.addressLabel}>Quote for:</span>
        <span className={styles.addressValue}>{address}</span>
      </div>

      {/* Package Cards */}
      <div className={styles.tiersGrid}>
        {tiers.map((tier) => {
          const tierKey = tier.tier.toLowerCase() as 'good' | 'better' | 'best';
          const isSelected = selectedTier === tierKey;
          const isSelecting = isLoading && isSelected;

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
                <h2 className={styles.tierName}>{tier.displayName}</h2>
                <p className={styles.tierDescription}>{tier.description}</p>
              </div>

              <div className={styles.priceSection}>
                <div className={styles.totalPrice}>
                  {formatPrice(tier.totalPrice)}
                </div>
                <div className={styles.pricePerSqft}>
                  {formatPrice(Math.round((tier.totalPrice / sqft) * 100) / 100)}/sq ft installed
                </div>
              </div>

              <ul className={styles.featuresList}>
                {tier.features.map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <Check size={16} className={styles.featureIcon} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.depositInfo}>
                <span className={styles.depositLabel}>Due today:</span>
                <span className={styles.depositAmount}>
                  {formatPrice(Math.round(tier.totalPrice * depositPercent / 100))} ({depositPercent}% deposit)
                </span>
              </div>

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
                    {isSelected ? 'Selected' : `Select ${tier.displayName}`}
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
          Not sure which to choose? Our Premium package is the most popular choice, offering the
          best balance of quality and value.
        </p>
      </div>
    </div>
  );
}

export default PackageSelection;
