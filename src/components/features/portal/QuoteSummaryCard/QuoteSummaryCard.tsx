'use client';

import { MapPin } from 'lucide-react';
import styles from './QuoteSummaryCard.module.css';

interface QuoteSummaryCardProps {
  address: string;
  city: string;
  state: string;
  packageTier: string;
  totalPrice: number;
  installDate?: string | null;
}

export function QuoteSummaryCard({
  address,
  city,
  state,
  packageTier,
  totalPrice,
  installDate,
}: QuoteSummaryCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const formattedDate = installDate
    ? new Date(installDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const tierLabel = packageTier.charAt(0).toUpperCase() + packageTier.slice(1);

  return (
    <div className={styles.card}>
      <div className={styles.addressSection}>
        <MapPin size={16} className={styles.mapIcon} />
        <span className={styles.address}>
          {address}, {city}, {state}
        </span>
      </div>
      <div className={styles.separator} />
      <div className={styles.metadataSection}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Package</span>
          <span className={styles.metaValue}>{tierLabel}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Total</span>
          <span className={`${styles.metaValue} ${styles.price}`}>{formattedPrice}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Install</span>
          <span className={styles.metaValue}>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
