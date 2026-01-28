import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { QuoteWizardProvider, Stage2Container, StageIndicator } from '@/components/features/quote';
import { TrustBar } from '@/components/ui';
import { DEPOSIT_CONFIG } from '@/lib/constants';
import styles from './page.module.css';

interface CustomizePageProps {
  params: Promise<{ id: string }>;
}

interface TierData {
  tier: string;
  displayName: string;
  description: string;
  totalPrice: number;
  features: string[];
  isPopular?: boolean;
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

  features.push(`${tier.warrantyYears}-year ${tier.warrantyType || ''} warranty`.trim());

  if (tier.underlaymentType) {
    features.push(tier.underlaymentType);
  }

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

export default async function CustomizePage({ params }: CustomizePageProps) {
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

  // Step guard: Ensure measurement data is available (Stage 1 completed)
  if (!quote.sqftTotal) {
    redirect('/quote/new');
  }

  const sqft = parseFloat(quote.sqftTotal);

  // Build tier cards with calculated prices
  const tierCards: TierData[] = pricingTiers.map((tier) => ({
    tier: tier.tier,
    displayName: tier.displayName,
    description: tier.description || '',
    totalPrice: calculateTierPrice(sqft, tier.materialPricePerSqft, tier.laborPricePerSqft),
    features: getTierFeatures(tier),
    isPopular: tier.isPopular,
  }));

  const address = `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`;

  // Initial wizard state from existing quote
  const initialWizardState = {
    quoteId,
    currentStage: 2 as const,
    currentSubStep: 'package' as const,
    propertyConfirmed: true,
    selectedTier: quote.selectedTier as 'good' | 'better' | 'best' | null,
  };

  return (
    <>
      <StageIndicator currentStage={2} quoteId={quoteId} />
      <main className={styles.main}>
        <QuoteWizardProvider initialData={initialWizardState}>
          <Stage2Container
            quoteId={quoteId}
            quoteData={{
              sqft,
              address,
              tiers: tierCards,
            }}
          />
        </QuoteWizardProvider>
        <TrustBar variant="light" />
      </main>
    </>
  );
}
