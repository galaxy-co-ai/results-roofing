import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db, schema, eq } from '@/db/index';
import { Header } from '@/components/layout';
import { TrustBar } from '@/components/ui';
import { CheckCircle2, Calendar, Phone, Mail, FileText, CreditCard, Check, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

// Force dynamic rendering to ensure fresh database queries
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Booking Confirmed | Results Roofing',
  description: 'Your roofing installation has been scheduled successfully.',
};

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

// Map tier keys to display names (must match pricingTiers.displayName in database)
const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Preferred',
  best: 'Signature',
};

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote) {
    notFound();
  }

  const address = `${quote.address}, ${quote.city}, ${quote.state} ${quote.zip}`;
  const tierName = quote.selectedTier ? TIER_DISPLAY_NAMES[quote.selectedTier] || quote.selectedTier : 'Selected';
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;

  // Format short date for condensed summary
  const formatShortDate = (date: Date | null, slotId: string | null) => {
    if (!date) return 'TBD';
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const time = slotId?.includes('morning') ? '8AM' : '12PM';
    return `${dateStr} @ ${time}`;
  };

  // Calculate deposit amount (10% of total)
  const depositAmount = Math.round(totalPrice * 0.1);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Success Icon */}
          <div className={styles.iconWrapper}>
            <CheckCircle2 className={styles.successIcon} />
          </div>

          {/* Title */}
          <h1 className={styles.title}>You&apos;re All Set!</h1>
          <p className={styles.subtitle}>
            Your roofing installation has been scheduled. We&apos;ll send you a confirmation email shortly.
          </p>

          {/* Condensed Installation Summary */}
          <div className={styles.installationSummary}>
            {address} • {formatShortDate(quote.scheduledDate, quote.scheduledSlotId)} • {tierName} Package
          </div>

          {/* Dashboard Preview Funnel */}
          <div className={styles.dashboardPreview}>
            <div className={styles.dashboardHeader}>
              <CheckCircle2 className={styles.dashboardHeaderIcon} />
              <span className={styles.dashboardHeaderTitle}>Your project dashboard is ready</span>
            </div>

            <div className={styles.actionPreviewList}>
              {/* Contract */}
              <div className={`${styles.previewItem} ${styles.previewItem_pending}`}>
                <FileText className={styles.previewItemIcon} />
                <span className={styles.previewItemLabel}>Contract ready to sign</span>
                <span className={styles.previewItemBadge}>Action needed</span>
              </div>

              {/* Deposit */}
              <div className={`${styles.previewItem} ${styles.previewItem_pending}`}>
                <CreditCard className={styles.previewItemIcon} />
                <span className={styles.previewItemLabel}>Deposit invoice</span>
                <span className={styles.previewItemBadge}>${depositAmount.toLocaleString()} due</span>
              </div>

              {/* Installation */}
              <div className={`${styles.previewItem} ${styles.previewItem_complete}`}>
                <Calendar className={styles.previewItemIcon} />
                <span className={styles.previewItemLabel}>Installation confirmed</span>
                <Check className={styles.previewItemCheck} />
              </div>
            </div>

            <Link href="/portal/dashboard" className={styles.dashboardCta}>
              Go to My Dashboard
              <ArrowRight className={styles.dashboardCtaIcon} />
            </Link>
          </div>

          {/* Contact Info */}
          <div className={styles.contactInfo}>
            <p className={styles.contactText}>Questions? We&apos;re here to help.</p>
            <div className={styles.contactMethods}>
              <a href="tel:+18005551234" className={styles.contactLink}>
                <Phone size={16} />
                (800) 555-1234
              </a>
              <a href="mailto:support@resultsroofing.com" className={styles.contactLink}>
                <Mail size={16} />
                support@resultsroofing.com
              </a>
            </div>
          </div>
        </div>

        <TrustBar variant="light" />
      </main>
    </>
  );
}
