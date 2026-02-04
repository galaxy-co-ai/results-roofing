'use client';

import { Skeleton } from '@/components/ui/SkeletonLegacy/Skeleton';
import styles from './Stage1.module.css';

/**
 * Loading skeleton for Stage 1 - Address Entry
 * 
 * Shows placeholder content while the page is loading.
 */
export function Stage1Skeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.subStepContent}>
        {/* Header skeleton */}
        <div className={styles.header}>
          <Skeleton variant="circular" width={64} height={64} />
          <Skeleton variant="text" width="80%" height={32} className={styles.skeletonTitle} />
          <Skeleton variant="text" width="60%" height={20} />
        </div>

        {/* Input section skeleton */}
        <div className={styles.inputSection}>
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="rounded" width="100%" height={48} />
        </div>

        {/* Service area skeleton */}
        <div className={styles.serviceArea}>
          <Skeleton variant="text" width={100} height={16} />
          <Skeleton variant="text" width="80%" height={14} />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Property Confirmation
 */
export function PropertyConfirmSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.subStepContent}>
        {/* Header */}
        <div className={styles.header}>
          <Skeleton variant="circular" width={64} height={64} />
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="80%" height={18} />
        </div>

        {/* Satellite image placeholder */}
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </div>
        </div>

        {/* Address display */}
        <Skeleton variant="text" width="50%" height={18} className={styles.addressDisplay} />

        {/* Actions */}
        <div className={styles.actions}>
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton variant="rounded" width="100%" height={48} />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Price Preview
 */
export function PricePreviewSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.subStepContent}>
        {/* Header */}
        <div className={styles.header}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width="50%" height={18} />
        </div>

        {/* Price tier cards */}
        <div className={styles.tiersContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.tierCard}>
              <div className={styles.tierInfo}>
                <Skeleton variant="text" width={80} height={18} />
                <Skeleton variant="text" width={150} height={14} />
              </div>
              <div className={styles.tierPrice}>
                <Skeleton variant="text" width={120} height={22} />
                <Skeleton variant="text" width={80} height={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <Skeleton variant="text" lines={2} width="90%" />

        {/* Actions */}
        <div className={styles.actionsVertical}>
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton variant="rounded" width={180} height={36} />
        </div>
      </div>
    </div>
  );
}

export default Stage1Skeleton;
