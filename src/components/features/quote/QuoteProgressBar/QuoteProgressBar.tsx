'use client';

import { Check } from 'lucide-react';
import styles from './QuoteProgressBar.module.css';

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'package', label: 'Package' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'contract', label: 'Contract' },
  { id: 'payment', label: 'Payment' },
] as const;

interface QuoteProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * QuoteProgressBar - Shows progress through the 5-step quote flow
 *
 * Steps: Address -> Package -> Checkout -> Contract -> Payment
 * Mobile: Shows numbers only
 * Desktop: Shows numbers + labels
 */
export function QuoteProgressBar({ currentStep, className = '' }: QuoteProgressBarProps) {
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

            return (
              <li
                key={step.id}
                className={`
                  ${styles.step}
                  ${isCompleted ? styles.step_completed : ''}
                  ${isCurrent ? styles.step_current : ''}
                  ${!isCompleted && !isCurrent ? styles.step_pending : ''}
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className={styles.stepIndicator}>
                  {isCompleted ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
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
