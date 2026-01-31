'use client';

import { useState } from 'react';
import { Check, Star, Shield, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { useWizard } from '../WizardContext';
import type { TierPriceRange } from '../WizardMachine';
import styles from './PackageSelect.module.css';

/**
 * Package tier configuration
 */
interface TierConfig {
  key: 'good' | 'better' | 'best';
  name: string;
  description: string;
  badge?: string;
  icon: typeof Shield;
  features: string[];
  warranty: string;
}

const TIER_CONFIGS: TierConfig[] = [
  {
    key: 'good',
    name: 'Good',
    description: 'Quality materials with standard installation',
    icon: Shield,
    features: [
      '3-tab architectural shingles',
      'Standard underlayment',
      'Basic ventilation',
      '5-year workmanship warranty',
    ],
    warranty: '5-Year Warranty',
  },
  {
    key: 'better',
    name: 'Better',
    description: 'Premium materials with enhanced protection',
    badge: 'Most Popular',
    icon: Star,
    features: [
      'Dimensional shingles',
      'Synthetic underlayment',
      'Ridge vent installation',
      'Ice & water shield',
      '10-year workmanship warranty',
    ],
    warranty: '10-Year Warranty',
  },
  {
    key: 'best',
    name: 'Best',
    description: 'Top-tier materials with maximum durability',
    icon: Zap,
    features: [
      'Designer shingles',
      'Premium synthetic underlayment',
      'Complete ventilation system',
      'Full ice & water shield',
      'Enhanced flashing package',
      'Lifetime workmanship warranty',
    ],
    warranty: 'Lifetime Warranty',
  },
];

/**
 * Format price for display
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Step 2: Package selection (Good/Better/Best)
 */
export function PackageSelect() {
  const { context, selectTier, goBack } = useWizard();
  const { priceRanges, selectedTier } = context;
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const handleSelectTier = (tier: 'good' | 'better' | 'best', tierId: string) => {
    selectTier(tier, tierId);
  };

  // Map price ranges to tier configs
  const getTierPrice = (tierKey: string): TierPriceRange | undefined => {
    return priceRanges?.find((p) => p.tier === tierKey);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Package</h1>
        <p className={styles.subtitle}>
          All packages include professional installation and cleanup
        </p>
      </div>

      {/* Tier cards */}
      <div className={styles.tiers} role="radiogroup" aria-label="Select a roofing package">
        {TIER_CONFIGS.map((config) => {
          const priceData = getTierPrice(config.key);
          const isSelected = selectedTier === config.key;
          const isHovered = hoveredTier === config.key;
          const Icon = config.icon;

          return (
            <button
              key={config.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`${config.key}-price ${config.key}-features`}
              className={`${styles.tierCard} ${isSelected ? styles.selected : ''} ${config.badge ? styles.popular : ''}`}
              onClick={() => priceData && handleSelectTier(config.key, priceData.tierId)}
              onMouseEnter={() => setHoveredTier(config.key)}
              onMouseLeave={() => setHoveredTier(null)}
              disabled={!priceData}
            >
              {/* Badge */}
              {config.badge && (
                <div className={styles.badge}>{config.badge}</div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  <Check size={16} />
                </div>
              )}

              {/* Card content */}
              <div className={styles.tierHeader}>
                <div className={styles.tierIcon}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.tierName}>{config.name}</h3>
                <p className={styles.tierDescription}>{config.description}</p>
              </div>

              {/* Price */}
              {priceData && (
                <div className={styles.tierPrice} id={`${config.key}-price`}>
                  <span className={styles.priceRange}>
                    {formatPrice(priceData.priceMin)} - {formatPrice(priceData.priceMax)}
                  </span>
                  <span className={styles.priceNote}>estimated total</span>
                </div>
              )}

              {/* Features preview */}
              <ul className={styles.tierFeatures} id={`${config.key}-features`}>
                {config.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <Check size={14} className={styles.featureCheck} />
                    <span>{feature}</span>
                  </li>
                ))}
                {config.features.length > 3 && (
                  <li className={styles.featureMore}>
                    +{config.features.length - 3} more features
                  </li>
                )}
              </ul>

              {/* Warranty */}
              <div className={styles.warranty}>
                <Shield size={14} />
                <span>{config.warranty}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compare packages link */}
      <button
        type="button"
        className={styles.compareButton}
        onClick={() => setShowComparison(true)}
      >
        <Info size={16} />
        Compare all packages
      </button>

      {/* Back button (desktop) */}
      <div className={styles.desktopNav}>
        <Button variant="ghost" onClick={goBack}>
          Back
        </Button>
      </div>

      {/* Comparison Modal */}
      <Modal
        open={showComparison}
        onClose={() => setShowComparison(false)}
        title="Package Comparison"
        size="lg"
      >
        <div className={styles.comparisonTable}>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                {TIER_CONFIGS.map((config) => (
                  <th key={config.key}>{config.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Materials */}
              <tr>
                <td>Shingles</td>
                <td>3-Tab</td>
                <td>Dimensional</td>
                <td>Designer</td>
              </tr>
              <tr>
                <td>Underlayment</td>
                <td>Standard</td>
                <td>Synthetic</td>
                <td>Premium Synthetic</td>
              </tr>
              <tr>
                <td>Ventilation</td>
                <td>Basic</td>
                <td>Ridge Vent</td>
                <td>Complete System</td>
              </tr>
              <tr>
                <td>Ice & Water Shield</td>
                <td>-</td>
                <td>Eaves Only</td>
                <td>Full Coverage</td>
              </tr>
              <tr>
                <td>Flashing</td>
                <td>Standard</td>
                <td>Enhanced</td>
                <td>Premium Package</td>
              </tr>
              {/* Warranty */}
              <tr>
                <td>Workmanship Warranty</td>
                <td>5 Years</td>
                <td>10 Years</td>
                <td>Lifetime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}

export default PackageSelect;
