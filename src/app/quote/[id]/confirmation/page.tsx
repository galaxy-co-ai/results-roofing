import { notFound } from 'next/navigation';
import { CheckCircle, Calendar, MapPin, Package, FileText } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import { StageIndicator } from '@/components/features/quote/StageIndicator';
import styles from './page.module.css';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote with order details
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote) {
    notFound();
  }

  // Get selected tier info
  const selectedTier = quote.selectedTier;
  const tierName = selectedTier === 'best' ? 'Elite' : selectedTier === 'better' ? 'Premium' : 'Essential';

  return (
    <>
      <StageIndicator currentStage={3} quoteId={quoteId} />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Success Icon */}
          <div className={styles.successIcon}>
            <CheckCircle size={64} aria-hidden="true" />
          </div>

          {/* Success Message */}
          <h1 className={styles.title}>Your Roof Replacement is Confirmed!</h1>
          <p className={styles.subtitle}>
            Thank you for choosing Results Roofing. We&apos;ve sent a confirmation email with all
            the details.
          </p>

          {/* Order Number */}
          <div className={styles.orderNumber}>
            <span className={styles.orderLabel}>Order Number</span>
            <span className={styles.orderId}>{quoteId.slice(0, 8).toUpperCase()}</span>
          </div>

          {/* Order Details */}
          <div className={styles.details}>
            <h2 className={styles.detailsTitle}>Order Details</h2>

            <div className={styles.detailRow}>
              <div className={styles.detailIcon}>
                <MapPin size={18} aria-hidden="true" />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Property Address</span>
                <span className={styles.detailValue}>
                  {quote.address}, {quote.city}, {quote.state} {quote.zip}
                </span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailIcon}>
                <Package size={18} aria-hidden="true" />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Selected Package</span>
                <span className={styles.detailValue}>{tierName} Package</span>
              </div>
            </div>

            {quote.scheduledDate && (
              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Calendar size={18} aria-hidden="true" />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Installation Date</span>
                  <span className={styles.detailValue}>
                    {formatDate(new Date(quote.scheduledDate))}
                    {quote.scheduledSlotId && ` (${quote.scheduledSlotId.includes('morning') ? 'morning' : 'afternoon'})`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className={styles.nextSteps}>
            <h2 className={styles.nextStepsTitle}>What Happens Next?</h2>
            <ol className={styles.stepsList}>
              <li className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <span className={styles.stepTitle}>Confirmation Email</span>
                  <span className={styles.stepDescription}>
                    Check your inbox for a detailed confirmation with all your order information.
                  </span>
                </div>
              </li>
              <li className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <span className={styles.stepTitle}>Pre-Installation Call</span>
                  <span className={styles.stepDescription}>
                    Our team will call you 2-3 days before installation to confirm details.
                  </span>
                </div>
              </li>
              <li className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <span className={styles.stepTitle}>Installation Day</span>
                  <span className={styles.stepDescription}>
                    Our crew will arrive on time and keep you updated throughout the process.
                  </span>
                </div>
              </li>
              <li className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <span className={styles.stepTitle}>Final Walkthrough</span>
                  <span className={styles.stepDescription}>
                    We&apos;ll do a quality inspection together and collect the final payment.
                  </span>
                </div>
              </li>
            </ol>
          </div>

          {/* Contract Link */}
          <a
            href={`/api/quotes/${quoteId}/contract/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contractLink}
          >
            <FileText size={18} aria-hidden="true" />
            View Your Contract (PDF)
          </a>

          {/* Contact Info */}
          <div className={styles.contact}>
            <p className={styles.contactText}>
              Questions? Reach us at{' '}
              <a href="tel:+18885551234" className={styles.contactLink}>
                (888) 555-1234
              </a>{' '}
              or{' '}
              <a href="mailto:support@resultsroofing.com" className={styles.contactLink}>
                support@resultsroofing.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
