import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { Header } from '@/components/layout';
import { TrustBar } from '@/components/ui';
import { ConfirmPageClient } from './ConfirmPageClient';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Confirm Your Booking | Results Roofing',
  description: 'Confirm your installation details and create your account.',
};

interface ConfirmPageProps {
  params: Promise<{ id: string }>;
}

const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Preferred',
  best: 'Signature',
};

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { id: quoteId } = await params;

  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote) {
    notFound();
  }

  if (!quote.sqftTotal) {
    redirect('/quote/new');
  }

  if (!quote.selectedTier || !quote.scheduledDate || !quote.scheduledSlotId) {
    redirect(`/quote/${quoteId}/customize`);
  }

  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const address = `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`;
  const tierDisplayName = TIER_DISPLAY_NAMES[quote.selectedTier!] || quote.selectedTier!;
  const timeSlot: 'morning' | 'afternoon' = quote.scheduledSlotId!.includes('morning')
    ? 'morning'
    : 'afternoon';

  return (
    <>
      <Header />
      <main className={styles.main}>
        <ConfirmPageClient
          quoteId={quoteId}
          quoteSummary={{
            address,
            tier: quote.selectedTier!,
            tierDisplayName,
            installDate: quote.scheduledDate!.toISOString(),
            timeSlot,
            totalPrice,
          }}
        />
        <TrustBar variant="light" />
      </main>
    </>
  );
}
