'use client';

import { useState } from 'react';
import { MapPin, Home, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import styles from './PropertyConfirm.module.css';

/**
 * Get satellite image URL from Google Maps Static API
 */
function getSatelliteImageUrl(lat: number, lng: number): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // Return a placeholder if no API key
    return '/images/placeholder-property.jpg';
  }

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=19&size=600x400&maptype=satellite&key=${apiKey}`;
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
  const { address, sqftEstimate, priceRanges, quoteId } = context;
  const [notMyProperty, setNotMyProperty] = useState(false);

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

  const satelliteUrl = address.lat && address.lng
    ? getSatelliteImageUrl(address.lat, address.lng)
    : '/images/placeholder-property.jpg';

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
        <img
          src={satelliteUrl}
          alt={`Satellite view of ${address.formattedAddress}`}
          className={styles.image}
        />
        <div className={styles.imageOverlay}>
          <MapPin size={24} />
        </div>
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
