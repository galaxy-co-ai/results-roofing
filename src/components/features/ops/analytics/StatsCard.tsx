'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './analytics.module.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = '#06b6d4',
  loading = false,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (loading) {
    return (
      <div className={styles.statsCard}>
        <div className={styles.statsCardSkeleton}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonValue} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsIcon} style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
        <Icon size={20} />
      </div>
      <div className={styles.statsContent}>
        <span className={styles.statsTitle}>{title}</span>
        <span className={styles.statsValue}>{value}</span>
        {change !== undefined && (
          <div className={`${styles.statsChange} ${isPositive ? styles.positive : ''} ${isNegative ? styles.negative : ''}`}>
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            <span>
              {isPositive && '+'}
              {change}% {changeLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
