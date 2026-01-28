import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { QuoteProgressBar } from '@/components/features/quote/QuoteProgressBar';
import ContractPageClient from './ContractPageClient';

interface ContractPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractPage({ params }: ContractPageProps) {
  const { id: quoteId } = await params;

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

  // Step guard: Ensure checkout is complete (step 3 completed)
  // Scheduling is required before contract
  if (!quote.scheduledDate) {
    redirect(`/quote/${quoteId}/checkout`);
  }

  const selectedTier = pricingTiers.find((t) => t.tier === quote.selectedTier);

  if (!selectedTier) {
    notFound();
  }

  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : 0;

  return (
    <>
      <QuoteProgressBar currentStep={4} quoteId={quoteId} />
      <ContractPageClient
        quoteId={quoteId}
        quote={{
          address: quote.address,
          city: quote.city,
          state: quote.state,
        }}
        tier={{
          displayName: selectedTier.displayName,
          shingleBrand: selectedTier.shingleBrand,
          shingleType: selectedTier.shingleType,
          warrantyYears: selectedTier.warrantyYears,
          warrantyType: selectedTier.warrantyType,
        }}
        totalPrice={totalPrice}
        depositAmount={depositAmount}
      />
    </>
  );
}
