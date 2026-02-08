'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, MapPin, ArrowLeft, Satellite } from 'lucide-react';
import type { ParsedAddress } from '@/components/features/address';
import { useSatelliteMeasurement } from '@/hooks/useSatelliteMeasurement';
import styles from './Stage1.module.css';

interface PropertyConfirmProps {
  address: ParsedAddress;
  onConfirm: (measurementData?: {
    sqftTotal: number;
    pitchPrimary: number;
    complexity: string;
    confidence: string;
  }) => void;
  onRetry: () => void;
  isLoading?: boolean;
  /** Quote ID — when provided, triggers satellite measurement on confirm */
  quoteId?: string;
}

/**
 * Stage 1, Sub-step 2: Property Confirmation
 *
 * Shows satellite view of the property.
 * User confirms this is the correct location.
 * On confirmation, triggers Google Solar satellite measurement.
 */
export function PropertyConfirm({
  address,
  onConfirm,
  onRetry,
  isLoading = false,
  quoteId,
}: PropertyConfirmProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const {
    fetchMeasurement,
    measurement,
    isLoading: isMeasuring,
    needsManualEntry,
    hasSatelliteData,
  } = useSatelliteMeasurement();

  // Timeout fallback: show map unavailable after 10s if image never loads
  useEffect(() => {
    if (imageLoaded || imageError) return;

    const timeout = setTimeout(() => {
      if (!imageLoaded) {
        setImageError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [imageLoaded, imageError]);

  // When satellite data arrives or manual entry is needed, proceed
  useEffect(() => {
    if (!confirmed) return;

    if (hasSatelliteData && measurement) {
      onConfirm({
        sqftTotal: measurement.sqftTotal,
        pitchPrimary: measurement.pitchPrimary,
        complexity: measurement.complexity,
        confidence: measurement.confidence,
      });
    } else if (needsManualEntry) {
      // Proceed without satellite data — manual entry will handle it
      onConfirm();
    }
  }, [confirmed, hasSatelliteData, measurement, needsManualEntry, onConfirm]);

  const handleConfirm = useCallback(() => {
    if (quoteId && address.lat && address.lng) {
      setConfirmed(true);
      fetchMeasurement(quoteId, address.lat, address.lng);
    } else {
      // No quoteId yet — let parent handle everything
      onConfirm();
    }
  }, [quoteId, address.lat, address.lng, fetchMeasurement, onConfirm]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const satelliteUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${address.lng},${address.lat},18,0/600x400@2x?access_token=${mapboxToken}`
    : null;

  const showMeasuring = confirmed && isMeasuring;
  const buttonDisabled = isLoading || showMeasuring;

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
                loading="eager"
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

      {/* Satellite Measurement Status */}
      {showMeasuring && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-blue-50, #eff6ff)',
            border: '1px solid var(--color-blue-200, #bfdbfe)',
            fontSize: '14px',
            color: 'var(--color-blue-700, #1d4ed8)',
            marginTop: '8px',
          }}
        >
          <Satellite size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>Analyzing roof from satellite imagery...</span>
          <Loader2 size={14} className={styles.spinner} aria-hidden="true" />
        </div>
      )}

      {hasSatelliteData && measurement && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-green-50, #f0fdf4)',
            border: '1px solid var(--color-green-200, #bbf7d0)',
            fontSize: '14px',
            marginTop: '8px',
          }}
        >
          <span style={{ fontWeight: 500, color: 'var(--color-green-800, #166534)' }}>
            Satellite Verified
          </span>
          <span style={{ color: 'var(--color-green-700, #15803d)' }}>
            {measurement.sqftTotal.toLocaleString()} sqft &middot;{' '}
            {measurement.pitchPrimary}/12 pitch &middot;{' '}
            {measurement.facetCount} roof planes
          </span>
        </div>
      )}

      {needsManualEntry && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-amber-50, #fffbeb)',
            border: '1px solid var(--color-amber-200, #fde68a)',
            fontSize: '14px',
            color: 'var(--color-amber-800, #92400e)',
            marginTop: '8px',
          }}
        >
          Satellite data unavailable for this property.
          You&apos;ll be able to enter roof details on the next step.
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleConfirm}
          disabled={buttonDisabled}
          aria-describedby="confirm-help"
        >
          {isLoading || showMeasuring ? (
            <>
              <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
              {showMeasuring ? 'Measuring your roof...' : 'Getting your estimate...'}
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
          disabled={buttonDisabled}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Try a different address
        </button>
      </div>

      <p id="confirm-help" className={styles.helpText}>
        We&apos;ll use satellite imagery to measure your roof
      </p>
    </div>
  );
}

export default PropertyConfirm;
