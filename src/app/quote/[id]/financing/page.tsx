import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CreditCard, DollarSign, Clock, Shield } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import styles from './page.module.css';

interface FinancingPageProps {
  params: Promise<{ id: string }>;
}

const FINANCING_OPTIONS = [
  {
    id: 'pay-full',
    title: 'Pay in Full',
    description: 'No interest, no monthly payments',
    badge: null,
    details: 'Pay your deposit today, balance due at completion',
  },
  {
    id: 'finance-12',
    title: '12 Month Financing',
    description: '0% APR for 12 months',
    badge: 'Popular',
    details: 'Split your project into 12 easy monthly payments',
  },
  {
    id: 'finance-24',
    title: '24 Month Financing',
    description: 'Low monthly payments',
    badge: null,
    details: 'Affordable payments over 24 months',
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function FinancingPage({ params }: FinancingPageProps) {
  const { id: quoteId } = await params;

  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });

  if (!quote || !quote.selectedTier) {
    notFound();
  }

  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const monthlyPayment12 = Math.round(totalPrice / 12);
  const monthlyPayment24 = Math.round(totalPrice / 24);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/checkout`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Back to Order Summary
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Payment Options</h1>
          <p className={styles.subtitle}>
            Choose how you&apos;d like to pay for your {formatCurrency(totalPrice)} project.
          </p>
        </div>

        {/* Financing Options */}
        <div className={styles.optionsGrid}>
          {FINANCING_OPTIONS.map((option) => (
            <div key={option.id} className={styles.optionCard}>
              {option.badge && (
                <div className={styles.badge}>{option.badge}</div>
              )}
              <div className={styles.optionIcon}>
                {option.id === 'pay-full' ? (
                  <DollarSign size={24} />
                ) : (
                  <CreditCard size={24} />
                )}
              </div>
              <h3 className={styles.optionTitle}>{option.title}</h3>
              <p className={styles.optionDescription}>{option.description}</p>
              
              <div className={styles.optionAmount}>
                {option.id === 'pay-full' && formatCurrency(totalPrice)}
                {option.id === 'finance-12' && `${formatCurrency(monthlyPayment12)}/mo`}
                {option.id === 'finance-24' && `${formatCurrency(monthlyPayment24)}/mo`}
              </div>
              
              <p className={styles.optionDetails}>{option.details}</p>
              
              <Link 
                href={`/quote/${quoteId}/schedule`} 
                className={`${styles.selectButton} ${option.badge ? styles.selectButton_primary : ''}`}
              >
                Select
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className={styles.trustSection}>
          <div className={styles.trustItem}>
            <Shield size={20} className={styles.trustIcon} />
            <span>Checking rates won&apos;t affect your credit score</span>
          </div>
          <div className={styles.trustItem}>
            <Clock size={20} className={styles.trustIcon} />
            <span>Approval in under 60 seconds</span>
          </div>
        </div>

        {/* Financing Partner Note */}
        <div className={styles.partnerNote}>
          <p>
            Financing provided by Wisetack. Subject to credit approval.
            See terms for details.
          </p>
        </div>
      </div>
    </main>
  );
}
