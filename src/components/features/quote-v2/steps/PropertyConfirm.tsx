'use client';

import { useState, useEffect } from 'react';
import { MapPin, Home, ArrowRight, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import styles from './PropertyConfirm.module.css';

/**
 * Get satellite image URL from Mapbox Static Images API
 */
function getSatelliteImageUrl(lat: number, lng: number): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return null;
  }

  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},18,0/600x400@2x?access_token=${token}`;
}

/**
 * Format price range for display
 */
function formatPriceRange(min: number, max: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

/**
 * Step 1b: Property confirmation with satellite image
 * User confirms this is the right property
 */
export function PropertyConfirm() {
  const { context, goBack, selectTier, error: wizardError } = useWizard();
  const { address, sqftEstimate, priceRanges } = context;
  const [notMyProperty, setNotMyProperty] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get satellite URL
  const satelliteUrl = address?.lat && address?.lng
    ? getSatelliteImageUrl(address.lat, address.lng)
    : null;

  // Timeout fallback: show placeholder after 10s if image never loads
  useEffect(() => {
    if (!satelliteUrl || imageLoaded || imageError) return;

    const timeout = setTimeout(() => {
      if (!imageLoaded) {
        setImageError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [satelliteUrl, imageLoaded, imageError]);

  // Get the "better" tier for display (default recommendation)
  const betterTier = priceRanges?.find((t) => t.tier === 'better');
  const priceDisplay = betterTier
    ? formatPriceRange(betterTier.priceMin, betterTier.priceMax)
    : null;

  const handleContinue = () => {
    // Go directly to tier selection with "better" as default
    if (betterTier) {
      selectTier('better', betterTier.tierId);
    }
  };

  const handleNotMyProperty = () => {
    setNotMyProperty(true);
    // Could add functionality to go back and edit address
    setTimeout(() => {
      goBack();
    }, 1500);
  };

  if (!address) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Is this your property?</h1>
        <p className={styles.subtitle}>
          We&apos;ll use satellite imagery to estimate your roof size
        </p>
      </div>

      {/* Satellite image */}
      <div className={styles.imageWrapper}>
        {satelliteUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className={styles.imagePlaceholder}>
                <Loader2 size={32} className={styles.spinner} />
                <span>Loading satellite view...</span>
              </div>
            )}
            <img
              src={satelliteUrl}
              alt={`Satellite view of ${address.formattedAddress}`}
              className={styles.image}
              style={{ display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className={styles.imagePlaceholder}>
            <MapPin size={32} />
            <span>Map view unavailable</span>
          </div>
        )}
        {imageLoaded && (
          <div className={styles.imageOverlay}>
            <MapPin size={24} />
          </div>
        )}
      </div>

      {/* Address display */}
      <div className={styles.addressCard}>
        <div className={styles.addressIcon}>
          <Home size={20} />
        </div>
        <div className={styles.addressContent}>
          <div className={styles.addressStreet}>{address.streetAddress}</div>
          <div className={styles.addressCity}>
            {address.city}, {address.state} {address.zip}
          </div>
        </div>
      </div>

      {/* Estimate preview */}
      {sqftEstimate && sqftEstimate > 0 && (
        <div className={styles.estimate}>
          <div className={styles.estimateItem}>
            <span className={styles.estimateLabel}>Estimated Roof Size</span>
            <span className={styles.estimateValue}>
              ~{sqftEstimate.toLocaleString()} sq ft
            </span>
          </div>
          {priceDisplay && (
            <div className={styles.estimateItem}>
              <span className={styles.estimateLabel}>Price Range</span>
              <span className={styles.estimatePrice}>{priceDisplay}</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {wizardError && (
        <div className={styles.error}>
          <AlertCircle size={18} />
          <span>{wizardError}</span>
        </div>
      )}

      {/* Not my property confirmation */}
      {notMyProperty && (
        <div className={styles.notMyProperty}>
          <Check size={18} />
          <span>Taking you back to update your address...</span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <Button
          onClick={handleContinue}
          disabled={notMyProperty}
          size="lg"
          className="w-full"
        >
          Yes, Continue
          <ArrowRight size={18} />
        </Button>
        <button
          type="button"
          onClick={handleNotMyProperty}
          disabled={notMyProperty}
          className={styles.notMyPropertyButton}
        >
          No, this isn&apos;t my property
        </button>
      </div>

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        This is an estimate based on satellite imagery. Final pricing will be
        confirmed after our on-site inspection.
      </p>
    </div>
  );
}

export default PropertyConfirm;
