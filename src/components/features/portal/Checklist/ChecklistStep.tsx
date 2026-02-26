'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import styles from './Checklist.module.css';

interface ChecklistStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'locked';
  ctaLabel?: string;
  ctaHref?: string;
  onClickCta?: () => void;
  dependencyText?: string;
}

export function ChecklistStep({
  stepNumber,
  title,
  description,
  status,
  ctaLabel,
  ctaHref,
  onClickCta,
  dependencyText,
}: ChecklistStepProps) {
  if (status === 'completed') {
    return (
      <div className={styles.stepCompleted}>
        <div className={styles.checkIcon}>
          <Check size={14} />
        </div>
        <span className={styles.stepCompletedTitle}>{title}</span>
        <span className={styles.completedLabel}>Completed</span>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className={styles.stepLocked}>
        <div className={styles.numberBadgeLocked}>{stepNumber}</div>
        <span className={styles.stepLockedTitle}>{title}</span>
        {dependencyText && (
          <span className={styles.dependencyText}>{dependencyText}</span>
        )}
      </div>
    );
  }

  // Active
  return (
    <div className={styles.stepActive}>
      <div className={styles.stepActiveContent}>
        <div className={styles.numberBadgeActive}>{stepNumber}</div>
        <div className={styles.stepActiveText}>
          <span className={styles.stepActiveTitle}>{title}</span>
          {description && (
            <span className={styles.stepActiveDescription}>{description}</span>
          )}
        </div>
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={styles.stepActiveCta}>
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && !ctaHref && onClickCta && (
        <button type="button" onClick={onClickCta} className={styles.stepActiveCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export type { ChecklistStepProps };
