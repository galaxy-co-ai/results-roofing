import { notFound } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { Header } from '@/components/layout';
import { TrustBar } from '@/components/ui';
import { CheckCircle2, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import styles from './page.module.css';

// Force dynamic rendering to ensure fresh database queries
export const dynamic = 'force-dynamic';

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

// Map tier keys to display names
const TIER_DISPLAY_NAMES: Record<string, string> = {
  good: 'Essential',
  better: 'Premium',
  best: 'Elite',
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

  // Format scheduled date
  const formatScheduledDate = (date: Date | null, slotId: string | null) => {
    if (!date) return 'To be scheduled';

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const timeSlot = slotId?.includes('morning') ? '8 AM - 12 PM' : '12 PM - 5 PM';
    return `${dateStr} • ${timeSlot}`;
  };

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

          {/* Quote Summary Card */}
          <div className={styles.summaryCard}>
            <h2 className={styles.cardTitle}>Installation Details</h2>

            <div className={styles.detailRow}>
              <MapPin className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Property</span>
                <span className={styles.detailValue}>{address}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <Calendar className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Scheduled Date</span>
                <span className={styles.detailValue}>
                  {formatScheduledDate(quote.scheduledDate, quote.scheduledSlotId)}
                </span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.priceRow}>
              <span className={styles.packageName}>{tierName} Package</span>
              <span className={styles.packagePrice}>${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className={styles.nextSteps}>
            <h3 className={styles.nextStepsTitle}>What happens next?</h3>
            <ol className={styles.stepsList}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>Our team will call you to confirm the details</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>We&apos;ll send a deposit invoice via email</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}>Our crew arrives on your scheduled date</span>
              </li>
            </ol>
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
