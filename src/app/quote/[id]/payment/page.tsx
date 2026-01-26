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
      with: {
        lead: true,
      },
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

  // Extract time slot from scheduledSlotId (format: "{date}-{timeSlot}")
  // The slot ID is like "2024-01-15T00:00:00.000Z-morning"
  const rawTimeSlot = quote.scheduledSlotId
    ? quote.scheduledSlotId.split('-').pop()
    : null;
  const scheduledTimeSlot = rawTimeSlot === 'morning' || rawTimeSlot === 'afternoon'
    ? rawTimeSlot
    : null;

  return (
    <>
      <QuoteProgressBar currentStep={5} />
      <PaymentPageClient
        quoteId={quoteId}
        totalPrice={totalPrice}
        depositAmount={depositAmount}
        tierName={selectedTier?.displayName || 'Selected'}
        scheduledDate={quote.scheduledDate ? quote.scheduledDate.toISOString() : null}
        scheduledTimeSlot={scheduledTimeSlot}
        customerEmail={quote.lead?.email || null}
      />
    </>
  );
}
