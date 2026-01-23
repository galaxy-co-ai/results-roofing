import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Mail, MessageCircle, Home, User } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import { ConfirmationSupport } from '@/components/features/support';
import { ConfirmationTracker } from '@/components/features/quote/ConfirmationTracker';
import styles from './page.module.css';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return 'To be scheduled';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const NEXT_STEPS = [
  {
    icon: Mail,
    title: 'Check Your Email',
    description: 'We\'ve sent your signed contract and receipt.',
  },
  {
    icon: Calendar,
    title: 'Mark Your Calendar',
    description: 'Your installation is scheduled. We\'ll remind you 2 days before.',
  },
  {
    icon: MessageCircle,
    title: 'We\'ll Be in Touch',
    description: 'Our team will reach out to confirm details and answer questions.',
  },
];

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote, order (if exists), and pricing tiers
  const [quote, order, pricingTiers] = await Promise.all([
    db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    }),
    db.query.orders.findFirst({
      where: eq(schema.orders.quoteId, quoteId),
    }),
    db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
    }),
  ]);

  if (!quote || !quote.selectedTier) {
    notFound();
  }

  const selectedTier = pricingTiers.find((t) => t.tier === quote.selectedTier);
  
  // Use real order data if available, otherwise fall back to quote data
  const totalPrice = order 
    ? parseFloat(order.totalPrice) 
    : (quote.totalPrice ? parseFloat(quote.totalPrice) : 0);
  const depositAmount = order 
    ? parseFloat(order.depositAmount) 
    : (quote.depositAmount ? parseFloat(quote.depositAmount) : 0);
  const balanceDue = order 
    ? parseFloat(order.balanceDue) 
    : (totalPrice - depositAmount);
  const confirmationNumber = order?.confirmationNumber || 'Pending';
  const scheduledDate = order?.scheduledStartDate || quote.scheduledDate;

  return (
    <main className={styles.main}>
      {/* Track confirmation and conversion */}
      <ConfirmationTracker
        quoteId={quoteId}
        orderId={order?.id || null}
        confirmationNumber={confirmationNumber}
        depositAmount={depositAmount}
        totalPrice={totalPrice}
        tier={quote.selectedTier}
      />
      
      <div className={styles.container}>
        {/* Success Header */}
        <div className={styles.successHeader}>
          <div className={styles.checkCircle}>
            <CheckCircle size={48} />
          </div>
          <h1 className={styles.title}>You&apos;re All Set!</h1>
          <p className={styles.subtitle}>
            Your roof replacement has been scheduled. We can&apos;t wait to get started!
          </p>
        </div>

        {/* Confirmation Number */}
        <div className={styles.confirmationBox}>
          <span className={styles.confirmationLabel}>Confirmation Number</span>
          <span className={styles.confirmationNumber}>{confirmationNumber}</span>
        </div>

        {/* Order Summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Property</span>
            <span className={styles.summaryValue}>
              {quote.address}, {quote.city}, {quote.state}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Package</span>
            <span className={styles.summaryValue}>{selectedTier?.displayName}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Installation Date</span>
            <span className={styles.summaryValue}>{formatDate(scheduledDate)}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total</span>
            <span className={styles.summaryValue}>{formatCurrency(totalPrice)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Deposit Paid</span>
            <span className={styles.summaryPaid}>{formatCurrency(depositAmount)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Balance Due</span>
            <span className={styles.summaryValue}>{formatCurrency(balanceDue)}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className={styles.nextStepsSection}>
          <h2 className={styles.nextStepsTitle}>What Happens Next</h2>
          <div className={styles.stepsList}>
            {NEXT_STEPS.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepIcon}>
                  <step.icon size={20} />
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {order && (
            <Link href="/portal/dashboard" className={styles.portalButton}>
              <User size={18} />
              View Your Portal
            </Link>
          )}
          <Link href="/" className={styles.homeButton}>
            <Home size={18} />
            Return Home
          </Link>
        </div>

        {/* Contact Info */}
        <ConfirmationSupport />
      </div>
    </main>
  );
}
