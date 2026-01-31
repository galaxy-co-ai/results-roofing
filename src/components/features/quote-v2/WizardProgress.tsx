'use client';

import { motion } from 'framer-motion';
import { Check, MapPin, Package, CreditCard } from 'lucide-react';
import { useWizardData } from './WizardContext';
import type { WizardStage } from './WizardMachine';
import styles from './WizardProgress.module.css';

/**
 * Stage configuration for progress display
 */
const STAGES: Array<{
  key: WizardStage;
  label: string;
  icon: typeof MapPin;
}> = [
  { key: 'property', label: 'Property', icon: MapPin },
  { key: 'package', label: 'Package', icon: Package },
  { key: 'checkout', label: 'Checkout', icon: CreditCard },
];

/**
 * Determines if a stage is complete based on current state
 */
function isStageComplete(targetStage: WizardStage, currentStage: WizardStage, currentState: string): boolean {
  const stageOrder: WizardStage[] = ['property', 'package', 'checkout'];
  const targetIndex = stageOrder.indexOf(targetStage);
  const currentIndex = stageOrder.indexOf(currentStage);

  // Stage is complete if we're past it
  if (currentIndex > targetIndex) return true;

  // Success state means all stages complete
  if (currentState === 'success') return true;

  return false;
}

/**
 * Determines if a stage is active (current)
 */
function isStageActive(targetStage: WizardStage, currentStage: WizardStage): boolean {
  return targetStage === currentStage;
}

/**
 * Unified progress indicator for the wizard
 * Shows three stages with icons and a connecting progress bar
 */
export function WizardProgress() {
  const { stage: currentStage, state, progress } = useWizardData();

  return (
    <div className={styles.container} role="navigation" aria-label="Quote wizard progress">
      {/* Progress bar background */}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Quote progress: ${progress}% complete`}
      >
        <motion.div
          className={styles.progressFill}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Stage indicators */}
      <ol className={styles.stages} aria-label="Quote wizard steps">
        {STAGES.map((stageConfig, index) => {
          const isComplete = isStageComplete(stageConfig.key, currentStage, state);
          const isActive = isStageActive(stageConfig.key, currentStage);
          const Icon = stageConfig.icon;

          return (
            <li
              key={stageConfig.key}
              className={`${styles.stage} ${isComplete ? styles.complete : ''} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Connector line (hidden for first item) */}
              {index > 0 && (
                <div
                  className={`${styles.connector} ${isComplete || isActive ? styles.connectorFilled : ''}`}
                />
              )}

              {/* Stage circle */}
              <div className={styles.stageCircle}>
                {isComplete ? (
                  <Check size={16} className={styles.checkIcon} />
                ) : (
                  <Icon size={16} />
                )}
              </div>

              {/* Stage label */}
              <span className={styles.stageLabel}>{stageConfig.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Compact progress bar (just the bar, no stages)
 * For mobile or minimal layouts
 */
export function WizardProgressBar() {
  const { progress } = useWizardData();

  return (
    <div
      className={styles.barContainer}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Quote progress: ${progress}% complete`}
    >
      <motion.div
        className={styles.bar}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}

export default WizardProgress;
