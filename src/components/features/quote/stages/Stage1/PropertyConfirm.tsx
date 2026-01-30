'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, MapPin, ArrowLeft } from 'lucide-react';
import type { ParsedAddress } from '@/components/features/address';
import styles from './Stage1.module.css';

interface PropertyConfirmProps {
  address: ParsedAddress;
  onConfirm: () => void;
  onRetry: () => void;
  isLoading?: boolean;
}

/**
 * Stage 1, Sub-step 2: Property Confirmation
 * 
 * Shows satellite view of the property.
 * User confirms this is the correct location.
 */
export function PropertyConfirm({
  address,
  onConfirm,
  onRetry,
  isLoading = false,
}: PropertyConfirmProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const satelliteUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${address.lng},${address.lat},18,0/600x400@2x?access_token=${mapboxToken}`
    : null;

  return (
    <div className={styles.subStep}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Is this your property?</h2>
        <p className={styles.subtitle}>
          Confirm this is the correct location for your quote
        </p>
      </div>

      {/* Satellite Image */}
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          {satelliteUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div className={styles.imagePlaceholder}>
                  <Loader2 size={32} className={styles.spinner} aria-hidden="true" />
                  <span className="sr-only">Loading satellite image...</span>
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
              <MapPin size={32} aria-hidden="true" />
              <span>Map view unavailable</span>
            </div>
          )}
        </div>
      </div>

      {/* Address Display */}
      <p className={styles.addressDisplay}>{address.formattedAddress}</p>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onConfirm}
          disabled={isLoading}
          aria-describedby="confirm-help"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
              Getting your estimate...
            </>
          ) : (
            <>
              <CheckCircle size={20} aria-hidden="true" />
              Yes, this is my property
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onRetry}
          disabled={isLoading}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Try a different address
        </button>
      </div>

      <p id="confirm-help" className={styles.helpText}>
        We&apos;ll use satellite imagery to estimate your roof size
      </p>
    </div>
  );
}

export default PropertyConfirm;
