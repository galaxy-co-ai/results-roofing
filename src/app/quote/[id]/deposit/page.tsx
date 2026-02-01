import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { Header } from '@/components/layout';
import { TrustBar, ProgressIndicator } from '@/components/ui';
import { DepositPageClient } from './DepositPageClient';
import styles from './page.module.css';

// Progress steps for the quote flow
const PROGRESS_STEPS = [
  { id: 'quote', label: 'Get Quote' },
  { id: 'customize', label: 'Customize' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'deposit', label: 'Deposit' },
];

// Force dynamic rendering to ensure fresh database queries
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Secure Your Installation | Results Roofing',
  description: 'Complete your deposit to lock in your installation date.',
};

interface DepositPageProps {
  params: Promise<{ id: string }>;
}

// Map tier keys to display names
const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Preferred',
  best: 'Signature',
};

export default async function DepositPage({ params }: DepositPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote with selected tier
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote) {
    notFound();
  }

  // Step guard: Ensure measurement data exists (Stage 1 completed)
  if (!quote.sqftTotal) {
    redirect('/quote/new');
  }

  // Step guard: Ensure package selection and scheduling are complete
  if (!quote.selectedTier || !quote.scheduledDate || !quote.scheduledSlotId) {
    redirect(`/quote/${quoteId}/customize`);
  }
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = 500; // Fixed $500 deposit for this flow
  const address = `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`;
  const tierDisplayName = TIER_DISPLAY_NAMES[quote.selectedTier!] || quote.selectedTier!;

  // Parse time slot from scheduledSlotId
  const timeSlot: 'morning' | 'afternoon' = quote.scheduledSlotId!.includes('morning')
    ? 'morning'
    : 'afternoon';

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Progress Indicator */}
        <div className={styles.progressSection}>
          <ProgressIndicator steps={PROGRESS_STEPS} currentStep={4} />
        </div>

        <DepositPageClient
          quoteId={quoteId}
          quoteSummary={{
            address,
            tier: quote.selectedTier!,
            tierDisplayName,
            installDate: quote.scheduledDate!.toISOString(),
            timeSlot,
            totalPrice,
            depositAmount,
          }}
        />
        <TrustBar variant="light" />
      </main>
    </>
  );
}
