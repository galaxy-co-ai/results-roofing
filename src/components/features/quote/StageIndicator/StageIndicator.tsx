'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { STAGE_CONFIG, type WizardStage } from '../QuoteWizardProvider';
import styles from './StageIndicator.module.css';

interface StageIndicatorProps {
  currentStage: WizardStage;
  quoteId?: string;
  className?: string;
}

/**
 * StageIndicator - Shows progress through the 3-stage quote wizard
 *
 * Inline layout: (circle) Label — (circle) Label — (circle) Label
 * Completed stages are clickable to allow navigation back.
 */
export function StageIndicator({ currentStage, quoteId, className = '' }: StageIndicatorProps) {
  const stages = [1, 2, 3] as const;

  const getStageUrl = (stage: WizardStage): string | null => {
    if (stage === 1) return null;
    if (!quoteId) return null;
    const pathFn = STAGE_CONFIG[stage].path;
    return typeof pathFn === 'function' ? pathFn(quoteId) : pathFn;
  };

  return (
    <nav
      className={`${styles.container} ${className}`}
      aria-label="Quote wizard progress"
    >
      <ol className={styles.stagesList}>
        {stages.map((stage, index) => {
          const isCompleted = stage < currentStage;
          const isCurrent = stage === currentStage;
          const isPending = stage > currentStage;
          const stageUrl = isCompleted ? getStageUrl(stage) : null;
          const isClickable = isCompleted && stageUrl;

          const stageContent = (
            <>
              <span className={styles.circle}>
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span>{stage}</span>
                )}
              </span>
              <span className={styles.label}>{STAGE_CONFIG[stage].label}</span>
            </>
          );

          return (
            <li
              key={stage}
              className={`
                ${styles.stage}
                ${isCompleted ? styles.completed : ''}
                ${isCurrent ? styles.current : ''}
                ${isPending ? styles.pending : ''}
              `}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Dash separator before this step (not the first) */}
              {index > 0 && (
                <span className={styles.dash} aria-hidden="true">—</span>
              )}

              {isClickable ? (
                <Link
                  href={stageUrl}
                  className={styles.stageLink}
                  aria-label={`Go back to ${STAGE_CONFIG[stage].label}`}
                >
                  {stageContent}
                </Link>
              ) : (
                <span className={styles.stageContent}>
                  {stageContent}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen reader summary */}
      <div className="sr-only">
        Stage {currentStage} of 3: {STAGE_CONFIG[currentStage].label}
      </div>
    </nav>
  );
}

export default StageIndicator;
