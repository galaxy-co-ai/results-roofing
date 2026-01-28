import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { QuoteWizardProvider, Stage3Container, StageIndicator } from '@/components/features/quote';
import { DEPOSIT_CONFIG } from '@/lib/constants';

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote with selected tier
  const [quote, pricingTiers] = await Promise.all([
    db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    }),
    db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
    }),
  ]);

  if (!quote) {
    notFound();
  }

  // Step guard: Ensure measurement data exists (Stage 1 completed)
  if (!quote.sqftTotal) {
    redirect('/quote/new');
  }

  // Step guard: Ensure a tier is selected (Stage 2 completed)
  if (!quote.selectedTier) {
    redirect(`/quote/${quoteId}/customize`);
  }

  const sqft = parseFloat(quote.sqftTotal);
  const selectedTierData = pricingTiers.find((t) => t.tier === quote.selectedTier);
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount 
    ? parseFloat(quote.depositAmount) 
    : Math.round(totalPrice * DEPOSIT_CONFIG.percentage);

  const address = `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`;

  // Parse time slot from scheduledSlotId if available (format: "morning" or "afternoon")
  const parseTimeSlot = (slotId: string | null): 'morning' | 'afternoon' | null => {
    if (!slotId) return null;
    if (slotId.includes('morning')) return 'morning';
    if (slotId.includes('afternoon')) return 'afternoon';
    return 'morning'; // Default to morning if slot exists but can't parse
  };

  // Initial wizard state from existing quote
  const initialWizardState = {
    quoteId,
    currentStage: 3 as const,
    currentSubStep: 'contact' as const,
    propertyConfirmed: true,
    selectedTier: quote.selectedTier as 'good' | 'better' | 'best',
    scheduledDate: quote.scheduledDate ? new Date(quote.scheduledDate) : null,
    timeSlot: parseTimeSlot(quote.scheduledSlotId),
    financingTerm: (quote.financingTerm as 'pay-full' | '12' | '24') ?? null,
    phone: '', // Phone is captured in the checkout flow
    smsConsent: false,
  };

  return (
    <>
      <StageIndicator currentStage={3} quoteId={quoteId} />
      <QuoteWizardProvider initialData={initialWizardState}>
        <Stage3Container
          quoteId={quoteId}
          quoteData={{
            address,
            sqft,
            selectedTier: {
              tier: quote.selectedTier,
              displayName: selectedTierData?.displayName || 'Selected Package',
              totalPrice,
              depositAmount,
            },
            scheduledDate: quote.scheduledDate?.toISOString(),
            timeSlot: parseTimeSlot(quote.scheduledSlotId) ?? undefined,
            financingTerm: quote.financingTerm ?? undefined,
          }}
        />
      </QuoteWizardProvider>
    </>
  );
}
