import { notFound } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import PaymentPageClient from './PaymentPageClient';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
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
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : 0;

  return (
    <PaymentPageClient
      quoteId={quoteId}
      totalPrice={totalPrice}
      depositAmount={depositAmount}
      tierName={selectedTier?.displayName || 'Selected'}
    />
  );
}
