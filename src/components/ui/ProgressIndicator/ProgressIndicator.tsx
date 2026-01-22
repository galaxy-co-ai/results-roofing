import { Check } from 'lucide-react';
import styles from './ProgressIndicator.module.css';

export interface ProgressStep {
  id: string;
  label: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

/**
 * ProgressIndicator - Shows progress through a multi-step flow
 * 
 * Used in the quote flow to show users where they are in the process.
 */
export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  return (
    <nav 
      className={`${styles.container} ${className}`}
      aria-label="Quote progress"
    >
      <ol className={styles.stepsList}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <li
              key={step.id}
              className={`${styles.step} ${
                isCompleted ? styles.step_completed : ''
              } ${isCurrent ? styles.step_current : ''} ${
                isPending ? styles.step_pending : ''
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className={styles.stepIndicator}>
                {isCompleted ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{stepNumber}</span>
                )}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {index < steps.length - 1 && (
                <div 
                  className={`${styles.connector} ${isCompleted ? styles.connector_completed : ''}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ProgressIndicator;
