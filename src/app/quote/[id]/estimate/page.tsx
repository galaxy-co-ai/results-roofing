import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronRight, Zap, Clock, Shield } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import { TrustBar } from '@/components/ui';
import styles from './page.module.css';

interface EstimatePageProps {
  params: Promise<{ id: string }>;
}

interface PricingTier {
  tier: string;
  displayName: string;
  description: string;
  priceMin: number;
  priceMax: number;
  depositMin: number;
  depositMax: number;
}

interface PricingData {
  estimated: boolean;
  sqftEstimate: number;
  sqftMin: number;
  sqftMax: number;
  confidence: string;
  source: string;
  tiers: PricingTier[];
}

function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return `$${min.toLocaleString()}`;
  }
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

export default async function EstimatePage({ params }: EstimatePageProps) {
  const { id: quoteId } = await params;

  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote) {
    notFound();
  }

  // Parse pricing data from JSON
  const pricingData = quote.pricingData as PricingData | null;

  if (!pricingData?.tiers) {
    // No pricing data - redirect to packages page
    notFound();
  }

  const { tiers, sqftMin, sqftMax } = pricingData;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Zap size={16} />
            Instant Estimate
          </div>
          <h1 className={styles.title}>Your Roof Replacement Estimate</h1>
          <p className={styles.address}>
            {quote.address}, {quote.city}, {quote.state} {quote.zip}
          </p>
        </div>

        {/* Estimate Disclaimer */}
        <div className={styles.disclaimer}>
          <p>
            Based on typical homes in your area ({sqftMin.toLocaleString()}-{sqftMax.toLocaleString()} sq ft).
            Final price will be based on exact satellite measurements.
          </p>
        </div>

        {/* Tier Cards */}
        <div className={styles.tiersGrid}>
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className={`${styles.tierCard} ${tier.tier === 'better' ? styles.tierCard_popular : ''}`}
            >
              {tier.tier === 'better' && (
                <div className={styles.popularBadge}>Most Popular</div>
              )}

              <h2 className={styles.tierName}>{tier.displayName}</h2>
              <p className={styles.tierDescription}>{tier.description}</p>

              <div className={styles.priceRange}>
                {formatPriceRange(tier.priceMin, tier.priceMax)}
              </div>

              <p className={styles.priceNote}>Estimated total</p>
            </div>
          ))}
        </div>

        {/* Value Props */}
        <div className={styles.valueProps}>
          <div className={styles.valueProp}>
            <div className={styles.valuePropIcon}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className={styles.valuePropTitle}>60-68% ROI</h3>
              <p className={styles.valuePropText}>Average return on resale</p>
            </div>
          </div>

          <div className={styles.valueProp}>
            <div className={styles.valuePropIcon}>
              <Clock size={20} />
            </div>
            <div>
              <h3 className={styles.valuePropTitle}>Faster Sale</h3>
              <p className={styles.valuePropText}>Homes sell 1-3 weeks faster</p>
            </div>
          </div>

          <div className={styles.valueProp}>
            <div className={styles.valuePropIcon}>
              <Check size={20} />
            </div>
            <div>
              <h3 className={styles.valuePropTitle}>19% Savings</h3>
              <p className={styles.valuePropText}>On insurance premiums</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <Link href={`/quote/${quoteId}/packages`} className={styles.primaryCta}>
            Get Exact Price
            <ChevronRight size={20} />
          </Link>
          <p className={styles.ctaNote}>
            We&apos;ll measure your roof using satellite imagery for an exact quote.
          </p>
        </div>

        {/* Trust Footer */}
        <div className={styles.trustFooter}>
          <p className={styles.trustText}>
            Transparent pricing. No hidden fees. All packages include professional installation,
            permits, and full cleanup.
          </p>
        </div>

        {/* Trust Credentials */}
        <TrustBar variant="light" />
      </div>
    </main>
  );
}
