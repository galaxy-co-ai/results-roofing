import { notFound } from 'next/navigation';
import { Check, Star, ChevronRight } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import { TrustBar } from '@/components/ui';
import styles from './page.module.css';

interface PackagesPageProps {
  params: Promise<{ id: string }>;
}

// Mock measurement data - in production this would come from the quote
const MOCK_SQFT = 2450;

interface TierCard {
  tier: string;
  displayName: string;
  description: string;
  materialPrice: number;
  laborPrice: number;
  totalPrice: number;
  shingleType: string;
  shingleBrand: string;
  warrantyYears: string;
  warrantyType: string | null;
  isPopular: boolean;
  features: string[];
}

function calculateTierPrice(
  sqft: number,
  materialPricePerSqft: string,
  laborPricePerSqft: string
): number {
  const materialCost = sqft * parseFloat(materialPricePerSqft);
  const laborCost = sqft * parseFloat(laborPricePerSqft);
  return Math.round(materialCost + laborCost);
}

function getTierFeatures(tier: { tier: string; warrantyYears: string; warrantyType: string | null; underlaymentType: string | null }): string[] {
  const features: string[] = [];

  // Add warranty feature
  features.push(`${tier.warrantyYears}-year ${tier.warrantyType || ''} warranty`.trim());

  // Add underlayment feature
  if (tier.underlaymentType) {
    features.push(tier.underlaymentType);
  }

  // Add tier-specific features
  if (tier.tier === 'good') {
    features.push('Standard cleanup and disposal');
    features.push('Basic inspection report');
  } else if (tier.tier === 'better') {
    features.push('Enhanced cleanup and disposal');
    features.push('Detailed inspection report');
    features.push('Starter strip and drip edge included');
  } else if (tier.tier === 'best') {
    features.push('Premium cleanup and disposal');
    features.push('Comprehensive inspection report');
    features.push('Full ridge vent system');
    features.push('Ice & water shield at all valleys');
    features.push('Transferable warranty coverage');
  }

  return features;
}

export default async function PackagesPage({ params }: PackagesPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote and pricing tiers
  const [quote, pricingTiers] = await Promise.all([
    db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    }),
    db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
      orderBy: (tiers, { asc }) => [asc(tiers.sortOrder)],
    }),
  ]);

  if (!quote) {
    notFound();
  }

  // Use quote sqft if available, otherwise mock data
  const sqft = quote.sqftTotal ? parseFloat(quote.sqftTotal) : MOCK_SQFT;

  // Build tier cards with calculated prices
  const tierCards: TierCard[] = pricingTiers.map((tier) => ({
    tier: tier.tier,
    displayName: tier.displayName,
    description: tier.description || '',
    materialPrice: sqft * parseFloat(tier.materialPricePerSqft),
    laborPrice: sqft * parseFloat(tier.laborPricePerSqft),
    totalPrice: calculateTierPrice(sqft, tier.materialPricePerSqft, tier.laborPricePerSqft),
    shingleType: tier.shingleType,
    shingleBrand: tier.shingleBrand || '',
    warrantyYears: tier.warrantyYears,
    warrantyType: tier.warrantyType,
    isPopular: tier.isPopular,
    features: getTierFeatures(tier),
  }));

  const depositPercent = 10;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your Package</h1>
          <p className={styles.subtitle}>
            Based on your {sqft.toLocaleString()} sq ft roof. All packages include professional installation, permits, and full cleanup.
          </p>
        </div>

        {/* Address Bar */}
        <div className={styles.addressBar}>
          <span className={styles.addressLabel}>Quote for:</span>
          <span className={styles.addressValue}>
            {quote.address}, {quote.city}, {quote.state} {quote.zip}
          </span>
        </div>

        {/* Tier Cards */}
        <div className={styles.tiersGrid}>
          {tierCards.map((tier) => (
            <div
              key={tier.tier}
              className={`${styles.tierCard} ${tier.isPopular ? styles.tierCard_popular : ''}`}
            >
              {tier.isPopular && (
                <div className={styles.popularBadge}>
                  <Star size={14} />
                  Most Popular
                </div>
              )}

              <div className={styles.tierHeader}>
                <h2 className={styles.tierName}>{tier.displayName}</h2>
                <p className={styles.tierDescription}>{tier.description}</p>
              </div>

              <div className={styles.priceSection}>
                <div className={styles.totalPrice}>
                  ${tier.totalPrice.toLocaleString()}
                </div>
                <div className={styles.priceBreakdown}>
                  <span>${Math.round(tier.totalPrice / sqft * 100) / 100}/sq ft installed</span>
                </div>
              </div>

              <div className={styles.materialInfo}>
                <div className={styles.shingleType}>{tier.shingleBrand}</div>
                <div className={styles.shingleStyle}>{tier.shingleType} shingles</div>
              </div>

              <ul className={styles.featuresList}>
                {tier.features.map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <Check size={16} className={styles.featureIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.depositInfo}>
                <span className={styles.depositLabel}>Due today:</span>
                <span className={styles.depositAmount}>
                  ${Math.round(tier.totalPrice * depositPercent / 100).toLocaleString()} ({depositPercent}% deposit)
                </span>
              </div>

              <form action={`/api/quotes/${quoteId}/select-tier`} method="POST">
                <input type="hidden" name="tier" value={tier.tier} />
                <button
                  type="submit"
                  className={`${styles.selectButton} ${tier.isPopular ? styles.selectButton_primary : ''}`}
                >
                  Select {tier.displayName}
                  <ChevronRight size={18} />
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className={styles.helpSection}>
          <p className={styles.helpText}>
            Not sure which to choose? Our Better package is the most popular choice, offering the best balance of quality and value.
          </p>
          <p className={styles.helpText}>
            All prices are valid for 30 days. Financing options available on the next step.
          </p>
        </div>

        {/* Trust Credentials */}
        <TrustBar variant="light" />
      </div>
    </main>
  );
}
