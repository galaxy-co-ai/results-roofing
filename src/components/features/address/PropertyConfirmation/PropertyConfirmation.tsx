'use client';

import { useState } from 'react';
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const satelliteUrl = apiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${address.lat},${address.lng}&zoom=19&size=400x300&scale=2&maptype=satellite&key=${apiKey}`
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
            <img
              src={satelliteUrl}
              alt={`Satellite view of ${address.formattedAddress}`}
              className={styles.satelliteImage}
              style={{ display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
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
