import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, FileText, Check, AlertCircle } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import styles from './page.module.css';

interface ContractPageProps {
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

const CONTRACT_SECTIONS = [
  { id: 'scope', title: 'Scope of Work', status: 'included' },
  { id: 'materials', title: 'Materials & Specifications', status: 'included' },
  { id: 'timeline', title: 'Project Timeline', status: 'included' },
  { id: 'payment', title: 'Payment Terms', status: 'included' },
  { id: 'warranty', title: 'Warranty Coverage', status: 'included' },
  { id: 'cancellation', title: 'Cancellation Policy', status: 'included' },
];

export default async function ContractPage({ params }: ContractPageProps) {
  const { id: quoteId } = await params;

  const [quote, pricingTiers] = await Promise.all([
    db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
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

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/schedule`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Back to Scheduling
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FileText size={32} />
          </div>
          <h1 className={styles.title}>Review Your Contract</h1>
          <p className={styles.subtitle}>
            Please review the terms below before signing. Your signature is legally binding.
          </p>
        </div>

        {/* Contract Summary Card */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Contract Summary</h2>
          
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
            <span className={styles.summaryLabel}>Materials</span>
            <span className={styles.summaryValue}>
              {selectedTier?.shingleBrand} {selectedTier?.shingleType}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Warranty</span>
            <span className={styles.summaryValue}>
              {selectedTier?.warrantyYears}-year {selectedTier?.warrantyType}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total Price</span>
            <span className={styles.summaryTotal}>{formatCurrency(totalPrice)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Deposit Due Today</span>
            <span className={styles.summaryDeposit}>{formatCurrency(depositAmount)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Balance Due at Completion</span>
            <span className={styles.summaryValue}>{formatCurrency(totalPrice - depositAmount)}</span>
          </div>
        </div>

        {/* Contract Sections Checklist */}
        <div className={styles.sectionsCard}>
          <h3 className={styles.sectionsTitle}>Contract Includes</h3>
          <ul className={styles.sectionsList}>
            {CONTRACT_SECTIONS.map((section) => (
              <li key={section.id} className={styles.sectionItem}>
                <Check size={16} className={styles.sectionCheck} />
                <span>{section.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Notice */}
        <div className={styles.notice}>
          <AlertCircle size={20} className={styles.noticeIcon} />
          <div>
            <p className={styles.noticeTitle}>Before you sign</p>
            <p className={styles.noticeText}>
              By signing this contract, you agree to the terms and conditions outlined above.
              You have 3 business days to cancel for a full refund of your deposit.
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className={styles.signatureSection}>
          <label htmlFor="signature" className={styles.signatureLabel}>
            Type your full legal name to sign
          </label>
          <input
            id="signature"
            type="text"
            className={styles.signatureInput}
            placeholder="Your Full Name"
            aria-describedby="signature-hint"
          />
          <p id="signature-hint" className={styles.signatureHint}>
            Your typed signature is legally binding
          </p>
        </div>

        {/* Continue Button */}
        <Link href={`/quote/${quoteId}/payment`} className={styles.continueButton}>
          Sign & Continue to Payment
          <ChevronRight size={20} />
        </Link>

        {/* Legal Footer */}
        <p className={styles.legalFooter}>
          Powered by Documenso. Your signed contract will be emailed to you immediately.
        </p>
      </div>
    </main>
  );
}
