'use client';

/**
 * @deprecated This component uses the old 5-step flow.
 * Use `StageIndicator` from '@/components/features/quote/StageIndicator' instead,
 * which implements the new 3-stage wizard (Get Your Quote → Customize → Confirm & Pay).
 *
 * This component is kept for backward compatibility with legacy routes:
 * - /quote/[id]/packages
 * - /quote/[id]/contract
 * - /quote/[id]/payment
 *
 * These routes will be removed in a future release.
 */

import Link from 'next/link';
import { Check } from 'lucide-react';
import styles from './QuoteProgressBar.module.css';

const STEPS = [
  { id: 'address', label: 'Address', path: '/quote/new' },
  { id: 'package', label: 'Package', path: '/packages' },
  { id: 'checkout', label: 'Checkout', path: '/checkout' },
  { id: 'contract', label: 'Contract', path: '/contract' },
  { id: 'payment', label: 'Payment', path: '/payment' },
] as const;

interface QuoteProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  quoteId?: string;
  className?: string;
}

/**
 * Get the URL for a step based on quote ID
 */
function getStepUrl(stepIndex: number, quoteId?: string): string | null {
  const step = STEPS[stepIndex];
  if (stepIndex === 0) {
    // Step 1 (Address) is always the same URL
    return step.path;
  }
  if (!quoteId) {
    // Can't navigate to other steps without a quote ID
    return null;
  }
  return `/quote/${quoteId}${step.path}`;
}

/**
 * QuoteProgressBar - Shows progress through the 5-step quote flow
 *
 * Steps: Address -> Package -> Checkout -> Contract -> Payment
 * Mobile: Shows numbers only
 * Desktop: Shows numbers + labels
 *
 * Completed steps are clickable to allow navigation back
 */
export function QuoteProgressBar({ currentStep, quoteId, className = '' }: QuoteProgressBarProps) {
  return (
    <nav
      className={`${styles.container} ${className}`}
      aria-label="Quote progress"
    >
      {/* Mobile step indicator */}
      <div className={styles.mobileIndicator}>
        Step {currentStep} of 5
      </div>

      {/* Desktop progress bar */}
      <div className={styles.progressBar}>
        {/* Background track */}
        <div className={styles.track} aria-hidden="true">
          <div
            className={styles.trackFill}
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <ol className={styles.stepsList}>
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const stepUrl = isCompleted ? getStepUrl(index, quoteId) : null;
            const isClickable = isCompleted && stepUrl;

            const stepContent = (
              <>
                <div className={styles.stepIndicator}>
                  {isCompleted ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </>
            );

            return (
              <li
                key={step.id}
                className={`
                  ${styles.step}
                  ${isCompleted ? styles.step_completed : ''}
                  ${isCurrent ? styles.step_current : ''}
                  ${!isCompleted && !isCurrent ? styles.step_pending : ''}
                  ${isClickable ? styles.step_clickable : ''}
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isClickable ? (
                  <Link
                    href={stepUrl}
                    className={styles.stepLink}
                    aria-label={`Go back to ${step.label} step`}
                  >
                    {stepContent}
                  </Link>
                ) : (
                  stepContent
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        Step {currentStep} of 5: {STEPS[currentStep - 1].label}
      </div>
    </nav>
  );
}

export default QuoteProgressBar;
