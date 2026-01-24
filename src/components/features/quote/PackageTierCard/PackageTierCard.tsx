'use client';

import { Check } from 'lucide-react';
import { Badge } from '@/components/ui';
import styles from './PackageTierCard.module.css';

type TierType = 'good' | 'better' | 'best';

interface PackageFeature {
  label: string;
  value: string;
  tooltip?: string;
}

interface PackageTierCardProps {
  /** Package tier */
  tier: TierType;
  /** Package display name */
  name: string;
  /** Price (exact or range) */
  price: number | { min: number; max: number };
  /** Monthly payment estimate */
  monthlyPayment?: number;
  /** List of features */
  features: PackageFeature[];
  /** Warranty term */
  warranty: string;
  /** Estimated timeline */
  timeline?: string;
  /** Show recommended badge */
  recommended?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Selection handler */
  onSelect: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Format currency for display
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Package tier card for Good/Better/Best selection (F04)
 */
export function PackageTierCard({
  tier,
  name,
  price,
  monthlyPayment,
  features,
  warranty,
  timeline,
  recommended = false,
  selected = false,
  onSelect,
  className = '',
}: PackageTierCardProps) {
  const priceDisplay = typeof price === 'number' 
    ? formatPrice(price)
    : `${formatPrice(price.min)} - ${formatPrice(price.max)}`;

  const cardClasses = [
    styles.card,
    styles[tier],
    selected ? styles.selected : '',
    recommended ? styles.recommended : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div 
      className={cardClasses}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.tierName}>{name}</h3>
          {recommended && (
            <Badge variant="default">
              Most Popular
            </Badge>
          )}
        </div>
        <div className={styles.tierLabel}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
      </div>

      {/* Price */}
      <div className={styles.priceSection}>
        <div className={styles.price}>{priceDisplay}</div>
        {monthlyPayment && (
          <div className={styles.monthly}>
            or {formatPrice(monthlyPayment)}/mo with financing
          </div>
        )}
      </div>

      {/* Features */}
      <ul className={styles.features}>
        {features.map((feature, index) => (
          <li key={index} className={styles.feature}>
            <Check size={16} className={styles.featureCheck} aria-hidden="true" />
            <span className={styles.featureLabel}>{feature.label}:</span>
            <span className={styles.featureValue}>{feature.value}</span>
          </li>
        ))}
        <li className={styles.feature}>
          <Check size={16} className={styles.featureCheck} aria-hidden="true" />
          <span className={styles.featureLabel}>Warranty:</span>
          <span className={styles.featureValue}>{warranty}</span>
        </li>
        {timeline && (
          <li className={styles.feature}>
            <Check size={16} className={styles.featureCheck} aria-hidden="true" />
            <span className={styles.featureLabel}>Timeline:</span>
            <span className={styles.featureValue}>{timeline}</span>
          </li>
        )}
      </ul>

      {/* CTA */}
      <button
        type="button"
        className={styles.selectButton}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        aria-label={`Select ${name} package`}
      >
        {selected ? 'Selected' : 'Select Package'}
      </button>
    </div>
  );
}

export default PackageTierCard;
