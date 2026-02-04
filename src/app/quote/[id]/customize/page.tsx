import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { Header } from '@/components/layout';
import { QuoteWizardProvider, Stage2Container, StageIndicator } from '@/components/features/quote';
import { TrustBar } from '@/components/ui';
import styles from './page.module.css';

// Force dynamic rendering to ensure fresh database queries
export const dynamic = 'force-dynamic';

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
  // Limit to 5 key features per tier for cleaner UI
  if (tier.tier === 'good') {
    return [
      `${tier.warrantyYears}-year ${tier.warrantyType || 'limited'} warranty`.trim(),
      'Synthetic felt underlayment',
      'Standard cleanup & disposal',
      'Basic inspection report',
      'Permits included',
    ];
  } else if (tier.tier === 'better') {
    return [
      `${tier.warrantyYears}-year ${tier.warrantyType || 'full'} warranty`.trim(),
      'Synthetic underlayment',
      'Starter strip & drip edge',
      'Enhanced cleanup & disposal',
      'Detailed inspection report',
    ];
  } else if (tier.tier === 'best') {
    return [
      'Lifetime transferable warranty',
      'Premium ice & water shield',
      'Full ridge vent system',
      'Premium cleanup & disposal',
      'Comprehensive inspection',
    ];
  }

  return [];
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

  // Determine correct sub-step based on quote state
  // If tier is selected, go to schedule. Otherwise start at package.
  const currentSubStep = quote.selectedTier ? 'schedule' : 'package';

  // Initial wizard state from existing quote
  const initialWizardState = {
    quoteId,
    currentStage: 2 as const,
    currentSubStep: currentSubStep as 'package' | 'schedule',
    propertyConfirmed: true,
    selectedTier: quote.selectedTier as 'good' | 'better' | 'best' | null,
  };

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <QuoteWizardProvider initialData={initialWizardState}>
          <StageIndicator currentStage={2} quoteId={quoteId} className={styles.stepper} />
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
