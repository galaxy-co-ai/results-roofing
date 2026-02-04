'use client';

import { Skeleton } from '@/components/ui/SkeletonLegacy/Skeleton';
import styles from './Stage2.module.css';

/**
 * Loading skeleton for Stage 2 - Package Selection
 */
export function Stage2Skeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.subStepContent}>
        {/* Header */}
        <div className={styles.header}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="80%" height={20} />
        </div>

        {/* Package cards */}
        <div className={styles.packagesGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.packageCardSkeleton}>
              <Skeleton variant="rectangular" width="100%" height={200} />
              <div className={styles.packageCardContent}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={16} />
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="rounded" width="100%" height={44} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Schedule Selection
 */
export function ScheduleSelectionSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.subStepContent}>
        {/* Header */}
        <div className={styles.header}>
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="text" width="70%" height={18} />
        </div>

        {/* Calendar skeleton */}
        <div className={styles.calendarSkeleton}>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </div>

        {/* Time slots */}
        <div className={styles.timeslotsSkeleton}>
          <Skeleton variant="rounded" width="48%" height={60} />
          <Skeleton variant="rounded" width="48%" height={60} />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Financing Selection
 */
export function FinancingSelectionSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.subStepContent}>
        {/* Header */}
        <div className={styles.header}>
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="text" width="60%" height={18} />
        </div>

        {/* Financing options */}
        <div className={styles.financingOptionsSkeleton}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.financingCardSkeleton}>
              <Skeleton variant="rounded" width="100%" height={100} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stage2Skeleton;
