import { notFound, redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { Header } from '@/components/layout';
import { TrustBar } from '@/components/ui';
import { DepositPageClient } from './DepositPageClient';
import styles from './page.module.css';

// Force dynamic rendering to ensure fresh database queries
export const dynamic = 'force-dynamic';

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

  // DEBUG: Log database query info
  const dbHost = process.env.DATABASE_URL?.match(/@([^/]+)\//)?.[1] || 'unknown';
  console.log('[DEBUG deposit page] Querying quote:', {
    quoteId,
    dbHost,
    timestamp: new Date().toISOString(),
  });

  // Fetch quote with selected tier
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  // DEBUG: Log query result
  console.log('[DEBUG deposit page] Query result:', {
    quoteId,
    found: !!quote,
    selectedTier: quote?.selectedTier,
    scheduledDate: quote?.scheduledDate,
    status: quote?.status,
    updatedAt: quote?.updatedAt,
  });

  if (!quote) {
    notFound();
  }

  // Step guard: Ensure measurement data exists (Stage 1 completed)
  if (!quote.sqftTotal) {
    redirect('/quote/new');
  }

  // DEBUG: Show what's missing instead of redirecting
  const missingFields: string[] = [];
  if (!quote.selectedTier) missingFields.push('selectedTier');
  if (!quote.scheduledDate) missingFields.push('scheduledDate');
  if (!quote.scheduledSlotId) missingFields.push('scheduledSlotId');

  if (missingFields.length > 0) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Debug: Missing Quote Data</h1>
            <p>Quote ID: {quoteId}</p>
            <p>Missing fields: {missingFields.join(', ')}</p>
            <p>Current quote data:</p>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify({
                selectedTier: quote.selectedTier,
                scheduledDate: quote.scheduledDate,
                scheduledSlotId: quote.scheduledSlotId,
                status: quote.status,
              }, null, 2)}
            </pre>
            <p style={{ marginTop: '1rem' }}>
              <a href={`/quote/${quoteId}/customize`}>← Back to customize</a>
            </p>
          </div>
        </main>
      </>
    );
  }

  // At this point we know all required fields exist (debug check above handles missing fields)
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
