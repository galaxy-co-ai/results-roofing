import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { QuoteProgressBar } from '@/components/features/quote/QuoteProgressBar';
import CheckoutPageClient from './CheckoutPageClient';

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

  // Step guard: Ensure measurement data exists (step 1 completed)
  if (!quote.sqftTotal) {
    redirect('/quote/new');
  }

  // Step guard: Ensure a tier is selected (step 2 completed)
  if (!quote.selectedTier) {
    redirect(`/quote/${quoteId}/packages`);
  }

  const selectedTierData = pricingTiers.find((t) => t.tier === quote.selectedTier);
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : 0;

  return (
    <>
      <QuoteProgressBar currentStep={3} quoteId={quoteId} />
      <CheckoutPageClient
        quoteId={quoteId}
        quote={{
          address: quote.address,
          city: quote.city,
          state: quote.state,
          sqftTotal: quote.sqftTotal,
        }}
        tierName={selectedTierData?.displayName || 'Selected'}
        totalPrice={totalPrice}
        depositAmount={depositAmount}
        warrantyYears={selectedTierData?.warrantyYears || '25'}
        warrantyType={selectedTierData?.warrantyType || null}
      />
    </>
  );
}
