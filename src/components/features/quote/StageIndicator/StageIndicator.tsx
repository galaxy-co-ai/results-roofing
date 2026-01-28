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
 * Stages: Get Your Quote → Customize → Confirm & Pay
 *
 * Completed stages are clickable to allow navigation back.
 * Current stage shows active state.
 * Pending stages are not clickable.
 */
export function StageIndicator({ currentStage, quoteId, className = '' }: StageIndicatorProps) {
  const stages = [1, 2, 3] as const;

  const getStageUrl = (stage: WizardStage): string | null => {
    if (stage === 1) {
      return STAGE_CONFIG[1].path;
    }
    if (!quoteId) {
      return null;
    }
    const pathFn = STAGE_CONFIG[stage].path;
    return typeof pathFn === 'function' ? pathFn(quoteId) : pathFn;
  };

  return (
    <nav
      className={`${styles.container} ${className}`}
      aria-label="Quote wizard progress"
    >
      <div className={styles.wrapper}>
        {/* Progress track */}
        <div className={styles.track} aria-hidden="true">
          <div
            className={styles.trackFill}
            style={{ width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stages */}
        <ol className={styles.stagesList}>
          {stages.map((stage) => {
            const isCompleted = stage < currentStage;
            const isCurrent = stage === currentStage;
            const isPending = stage > currentStage;
            const stageUrl = isCompleted ? getStageUrl(stage) : null;
            const isClickable = isCompleted && stageUrl;

            const stageContent = (
              <>
                <div className={styles.stageIndicator}>
                  {isCompleted ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <span>{stage}</span>
                  )}
                </div>
                <div className={styles.stageInfo}>
                  <span className={styles.stageLabel}>{STAGE_CONFIG[stage].label}</span>
                </div>
              </>
            );

            return (
              <li
                key={stage}
                className={`
                  ${styles.stage}
                  ${isCompleted ? styles.stage_completed : ''}
                  ${isCurrent ? styles.stage_current : ''}
                  ${isPending ? styles.stage_pending : ''}
                  ${isClickable ? styles.stage_clickable : ''}
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isClickable ? (
                  <Link
                    href={stageUrl}
                    className={styles.stageLink}
                    aria-label={`Go back to ${STAGE_CONFIG[stage].label}`}
                  >
                    {stageContent}
                  </Link>
                ) : (
                  <div className={styles.stageContent}>
                    {stageContent}
                  </div>
                )}

                {/* Connector line */}
                {stage < 3 && (
                  <div
                    className={`${styles.connector} ${isCompleted ? styles.connector_completed : ''}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        Stage {currentStage} of 3: {STAGE_CONFIG[currentStage].label}
      </div>
    </nav>
  );
}

export default StageIndicator;
