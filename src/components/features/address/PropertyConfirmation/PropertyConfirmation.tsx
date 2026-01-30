'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, MapPin } from 'lucide-react';
import type { ParsedAddress } from '../AddressAutocomplete';
import styles from './PropertyConfirmation.module.css';

interface PropertyConfirmationProps {
  address: ParsedAddress;
  onConfirm: () => void;
  onRetry: () => void;
  isLoading?: boolean;
}

export function PropertyConfirmation({
  address,
  onConfirm,
  onRetry,
  isLoading = false,
}: PropertyConfirmationProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const satelliteUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${address.lng},${address.lat},18,0/600x400@2x?access_token=${mapboxToken}`
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Is this your property?</h2>
        <p className={styles.subtitle}>
          Confirm this is the correct location for your quote
        </p>
      </div>

      <div className={styles.imageWrapper}>
        {satelliteUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className={styles.imagePlaceholder}>
                <Loader2 size={32} className={styles.spinner} />
              </div>
            )}
            <Image
              src={satelliteUrl}
              alt={`Satellite view of ${address.formattedAddress}`}
              className={styles.satelliteImage}
              style={{ display: imageLoaded ? 'block' : 'none' }}
              width={600}
              height={400}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
            />
          </>
        ) : (
          <div className={styles.imagePlaceholder}>
            <MapPin size={32} />
          </div>
        )}
      </div>

      <p className={styles.address}>{address.formattedAddress}</p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Yes, this is my property
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.retryButton}
          onClick={onRetry}
          disabled={isLoading}
        >
          No, try a different address
        </button>
      </div>
    </div>
  );
}

export default PropertyConfirmation;
