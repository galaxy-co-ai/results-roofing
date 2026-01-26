import { notFound } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { QuoteProgressBar } from '@/components/features/quote/QuoteProgressBar';
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

  // Format scheduled date for display
  const scheduledDate = quote.scheduledDate
    ? new Date(quote.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const scheduledTimeSlot = quote.scheduledTimeSlot || null;

  return (
    <>
      <QuoteProgressBar currentStep={5} />
      <PaymentPageClient
        quoteId={quoteId}
        totalPrice={totalPrice}
        depositAmount={depositAmount}
        tierName={selectedTier?.displayName || 'Selected'}
        address={`${quote.address}, ${quote.city}, ${quote.state}`}
        scheduledDate={scheduledDate}
        scheduledTimeSlot={scheduledTimeSlot}
      />
    </>
  );
}
