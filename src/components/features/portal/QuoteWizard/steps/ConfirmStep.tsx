'use client';

import { MapPin } from 'lucide-react';
import styles from '../QuoteWizard.module.css';

interface ConfirmStepProps {
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    formattedAddress: string;
  };
  onConfirm: () => void;
  onRetry: () => void;
}

export function ConfirmStep({ address, onConfirm, onRetry }: ConfirmStepProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const satelliteUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${address.lng},${address.lat},18,0/600x400@2x?access_token=${mapboxToken}`
    : null;

  return (
    <div className={styles.stepContent}>
      {satelliteUrl && (
        <div className={styles.mapContainer}>
          <img
            src={satelliteUrl}
            alt={`Satellite view of ${address.formattedAddress}`}
            className={styles.mapImage}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MapPin size={18} style={{ color: 'var(--rr-color-blue)', flexShrink: 0 }} />
        <p className={styles.confirmAddress}>
          {address.streetAddress}, {address.city}, {address.state} {address.zip}
        </p>
      </div>

      <div className={styles.confirmActions}>
        <button type="button" onClick={onConfirm} className={styles.primaryButton}>
          Yes, that&apos;s my property
        </button>
        <button type="button" onClick={onRetry} className={styles.retryLink}>
          No, try again
        </button>
      </div>
    </div>
  );
}
