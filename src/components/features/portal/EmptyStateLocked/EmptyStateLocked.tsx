'use client';

import { Lock, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import styles from './EmptyStateLocked.module.css';

interface EmptyStateLockedProps {
  title: string;
  description: string;
  currentStep: number;
  ctaLabel: string;
  ctaHref: string;
  icon?: LucideIcon;
}

export function EmptyStateLocked({
  title,
  description,
  currentStep,
  ctaLabel,
  ctaHref,
  icon: Icon = Lock,
}: EmptyStateLockedProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconCircle}>
        <Icon size={24} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <span className={styles.progress}>Step {currentStep} of 5</span>

      {/* Skeleton preview */}
      <div className={styles.skeleton}>
        <div className={styles.skeletonBar} style={{ width: '80%' }} />
        <div className={styles.skeletonBar} style={{ width: '60%' }} />
        <div className={styles.skeletonBar} style={{ width: '70%' }} />
        <div className={styles.skeletonBar} style={{ width: '30%' }} />
      </div>

      <Link href={ctaHref} className={styles.cta}>
        {ctaLabel}
      </Link>
    </div>
  );
}
