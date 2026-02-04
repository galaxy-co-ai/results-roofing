'use client';

import { Skeleton } from '@/components/ui/SkeletonLegacy/Skeleton';
import styles from './Stage3.module.css';

/**
 * Loading skeleton for Stage 3 - Checkout
 */
export function Stage3Skeleton() {
  return (
    <div className={styles.layout}>
      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <Skeleton variant="text" width="50%" height={32} />
          <Skeleton variant="text" width="70%" height={18} />
        </div>

        {/* Contact section skeleton */}
        <div className={styles.section}>
          <Skeleton variant="text" width={150} height={22} />
          <div className={styles.formGroup}>
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="rounded" width="100%" height={48} />
          </div>
          <div className={styles.formGroup}>
            <Skeleton variant="rounded" width="100%" height={60} />
          </div>
        </div>

        {/* Contract section skeleton */}
        <div className={styles.section}>
          <Skeleton variant="text" width={180} height={22} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </div>

        {/* Signature section skeleton */}
        <div className={styles.section}>
          <Skeleton variant="text" width={120} height={22} />
          <Skeleton variant="rounded" width="100%" height={100} />
        </div>

        {/* Payment section skeleton */}
        <div className={styles.section}>
          <Skeleton variant="text" width={100} height={22} />
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton variant="rounded" width="100%" height={48} />
        </div>
      </div>

      {/* Sidebar skeleton */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <Skeleton variant="text" width={140} height={20} />
          <Skeleton variant="rectangular" width="100%" height={1} />
          <div className={styles.sidebarItem}>
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width={80} height={16} />
          </div>
          <div className={styles.sidebarItem}>
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width={60} height={16} />
          </div>
          <Skeleton variant="rectangular" width="100%" height={1} />
          <div className={styles.sidebarItem}>
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="text" width={100} height={24} />
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Stage3Skeleton;
