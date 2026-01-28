'use client';

import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FinancingSelector } from '@/components/features/checkout/FinancingSelector';
import styles from './Stage2.module.css';

interface FinancingSelectionProps {
  totalAmount: number;
  selectedTerm: 'pay-full' | '12' | '24' | null;
  onTermSelect: (term: 'pay-full' | '12' | '24') => void;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

/**
 * Stage 2, Sub-step 3: Financing Selection
 * 
 * User chooses payment option (pay full, 12mo, 24mo).
 */
export function FinancingSelection({
  totalAmount,
  selectedTerm,
  onTermSelect,
  onContinue,
  onBack,
  isLoading = false,
}: FinancingSelectionProps) {
  const canContinue = !!selectedTerm;

  return (
    <div className={styles.subStep}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Payment Option</h2>
        <p className={styles.subtitle}>
          Select how you&apos;d like to pay for your new roof. Financing available with 0% APR.
        </p>
      </div>

      {/* Financing Selector */}
      <div className={styles.selectorWrapper}>
        <FinancingSelector
          totalAmount={totalAmount}
          selectedTerm={selectedTerm}
          onTermChange={onTermSelect}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className={styles.actionsRow}>
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          className={styles.continueButton}
          disabled={!canContinue || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
              Loading...
            </>
          ) : (
            <>
              Continue to Checkout
              <ChevronRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default FinancingSelection;
