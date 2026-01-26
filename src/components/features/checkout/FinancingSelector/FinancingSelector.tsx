'use client';

import { CreditCard, Check } from 'lucide-react';
import styles from './FinancingSelector.module.css';

type FinancingTerm = 'pay-full' | '12' | '24';

interface FinancingSelectorProps {
  totalAmount: number;
  selectedTerm: FinancingTerm | null;
  onTermChange: (term: FinancingTerm) => void;
  disabled?: boolean;
  className?: string;
}

interface FinancingOption {
  id: FinancingTerm;
  label: string;
  description: string;
  getMonthlyPayment: (total: number) => number | null;
  badge?: string;
}

const FINANCING_OPTIONS: FinancingOption[] = [
  {
    id: 'pay-full',
    label: 'Pay in Full',
    description: 'One-time payment',
    getMonthlyPayment: () => null,
    badge: 'Best Value',
  },
  {
    id: '12',
    label: '12 Months',
    description: '0% APR financing',
    getMonthlyPayment: (total) => total / 12,
  },
  {
    id: '24',
    label: '24 Months',
    description: 'Low monthly payments',
    getMonthlyPayment: (total) => total / 24,
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

/**
 * FinancingSelector - Payment options radio selection
 *
 * Options: Pay Full | 12 Month | 24 Month
 * Shows calculated monthly payments
 */
export function FinancingSelector({
  totalAmount,
  selectedTerm,
  onTermChange,
  disabled = false,
  className = '',
}: FinancingSelectorProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <CreditCard size={20} className={styles.headerIcon} aria-hidden="true" />
        <h3 className={styles.headerTitle}>Payment Options</h3>
      </div>

      <div className={styles.options} role="radiogroup" aria-label="Payment options">
        {FINANCING_OPTIONS.map((option) => {
          const isSelected = selectedTerm === option.id;
          const monthlyPayment = option.getMonthlyPayment(totalAmount);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onTermChange(option.id)}
              disabled={disabled}
              className={`
                ${styles.option}
                ${isSelected ? styles.option_selected : ''}
              `}
              role="radio"
              aria-checked={isSelected}
            >
              <div className={styles.optionLeft}>
                {/* Radio indicator */}
                <div className={`${styles.radio} ${isSelected ? styles.radio_selected : ''}`}>
                  {isSelected && <Check size={12} aria-hidden="true" />}
                </div>

                <div className={styles.optionContent}>
                  <div className={styles.optionLabelRow}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    {option.badge && (
                      <span className={styles.badge}>{option.badge}</span>
                    )}
                  </div>
                  <span className={styles.optionDescription}>{option.description}</span>
                </div>
              </div>

              <div className={styles.optionRight}>
                {monthlyPayment ? (
                  <>
                    <span className={styles.monthlyAmount}>
                      {formatCurrency(monthlyPayment)}
                      <span className={styles.perMonth}>/mo</span>
                    </span>
                    <span className={styles.totalNote}>
                      Total: {formatCurrency(totalAmount)}
                    </span>
                  </>
                ) : (
                  <span className={styles.fullAmount}>
                    {formatCurrency(totalAmount)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className={styles.disclaimer}>
        All financing options subject to credit approval. 0% APR available for qualified buyers.
      </p>
    </div>
  );
}

export default FinancingSelector;
