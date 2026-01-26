import { notFound } from 'next/navigation';
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

  if (!quote || !quote.selectedTier) {
    notFound();
  }

  const selectedTier = pricingTiers.find((t) => t.tier === quote.selectedTier);

  if (!selectedTier) {
    notFound();
  }

  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : 0;

  return (
    <>
      <QuoteProgressBar currentStep={4} />
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
