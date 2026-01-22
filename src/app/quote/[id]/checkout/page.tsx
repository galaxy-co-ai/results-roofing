import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, Calendar, FileText, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import { ProgressIndicator } from '@/components/ui';
import styles from './page.module.css';

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

const CHECKOUT_STEPS = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'contract', label: 'Review & Sign', icon: FileText },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

const PROGRESS_STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'packages', label: 'Package' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'payment', label: 'Payment' },
  { id: 'done', label: 'Done' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id: quoteId } = await params;

  // Fetch quote with selected tier
  const [quote, pricingTiers] = await Promise.all([
    db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    }),
    db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
    }),
  ]);

  if (!quote) {
    notFound();
  }

  // Ensure a tier is selected
  if (!quote.selectedTier) {
    notFound();
  }

  const selectedTierData = pricingTiers.find((t) => t.tier === quote.selectedTier);
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : 0;

  return (
    <>
      <ProgressIndicator steps={PROGRESS_STEPS} currentStep={3} />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Back Link */}
          <Link href={`/quote/${quoteId}/packages`} className={styles.backLink}>
            <ChevronLeft size={18} />
            Change Package
          </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Order</h1>
          <p className={styles.subtitle}>
            Review your selection and schedule your installation.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Package</span>
              <span className={styles.summaryValue}>{selectedTierData?.displayName}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Address</span>
              <span className={styles.summaryValue}>
                {quote.address}, {quote.city}, {quote.state}
              </span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Roof Size</span>
              <span className={styles.summaryValue}>
                {quote.sqftTotal ? parseFloat(quote.sqftTotal).toLocaleString() : '—'} sq ft
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryTotal}>{formatCurrency(totalPrice)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Deposit Due Today</span>
              <span className={styles.summaryDeposit}>{formatCurrency(depositAmount)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className={styles.stepsSection}>
          <h2 className={styles.stepsTitle}>Next Steps</h2>

          <div className={styles.stepsList}>
            {CHECKOUT_STEPS.map((step, index) => (
              <div key={step.id} className={styles.step}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepContent}>
                  <div className={styles.stepIcon}>
                    <step.icon size={20} />
                  </div>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Link href={`/quote/${quoteId}/financing`} className={styles.continueButton}>
          Continue to Payment Options
          <ChevronRight size={20} />
        </Link>

        {/* Included Items */}
        <div className={styles.includedSection}>
          <h3 className={styles.includedTitle}>Included in Your Package</h3>
          <ul className={styles.includedList}>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              Professional installation by licensed crew
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              All permits and inspections
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              Material delivery and staging
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              Complete cleanup and debris removal
            </li>
            <li className={styles.includedItem}>
              <Check size={16} className={styles.includedIcon} />
              {selectedTierData?.warrantyYears}-year {selectedTierData?.warrantyType} warranty
            </li>
          </ul>
        </div>
        </div>
      </main>
    </>
  );
}
