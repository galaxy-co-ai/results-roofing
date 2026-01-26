'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Check, AlertCircle } from 'lucide-react';
import { SignatureCapture } from '@/components/features/contract/SignatureCapture';
import styles from './page.module.css';

interface ContractPageClientProps {
  quoteId: string;
  quote: {
    address: string;
    city: string;
    state: string;
  };
  tier: {
    displayName: string;
    shingleBrand: string | null;
    shingleType: string;
    warrantyYears: string;
    warrantyType: string | null;
  };
  totalPrice: number;
  depositAmount: number;
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
  { id: 'scope', title: 'Scope of Work' },
  { id: 'materials', title: 'Materials & Specifications' },
  { id: 'timeline', title: 'Project Timeline' },
  { id: 'payment', title: 'Payment Terms' },
  { id: 'warranty', title: 'Warranty Coverage' },
  { id: 'cancellation', title: 'Cancellation Policy' },
];

export function ContractPageClient({
  quoteId,
  quote,
  tier,
  totalPrice,
  depositAmount,
}: ContractPageClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignatureSubmit = async (signature: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          agreedToTerms: true,
          signedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save contract');
      }

      // Navigate to payment page
      router.push(`/quote/${quoteId}/payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/checkout`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Back to Checkout
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
            <span className={styles.summaryValue}>{tier.displayName}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Materials</span>
            <span className={styles.summaryValue}>
              {tier.shingleBrand} {tier.shingleType}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Warranty</span>
            <span className={styles.summaryValue}>
              {tier.warrantyYears}-year {tier.warrantyType}
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

        {/* Error message */}
        {error && (
          <div className={styles.error}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Signature Section */}
        <SignatureCapture
          onSignatureSubmit={handleSignatureSubmit}
          disabled={isSubmitting}
          className={styles.signatureSection}
        />

        {/* Legal Footer */}
        <p className={styles.legalFooter}>
          Powered by Documenso. Your signed contract will be emailed to you immediately.
        </p>
      </div>
    </main>
  );
}

export default ContractPageClient;
