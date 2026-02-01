'use client';

import { useState } from 'react';
import { MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { AddressAutocomplete, type ParsedAddress } from '@/components/features/address';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import styles from './PropertyAddress.module.css';

/**
 * Step 1a: Address entry
 * User enters their property address using the autocomplete
 */
export function PropertyAddress() {
  const { setAddress, confirmProperty, context, error: wizardError } = useWizard();
  const [localAddress, setLocalAddress] = useState<ParsedAddress | null>(context.address);
  const [outOfArea, setOutOfArea] = useState(false);

  const handleAddressSelect = (address: ParsedAddress) => {
    setLocalAddress(address);
    setAddress(address);
    setOutOfArea(false);
  };

  const handleServiceAreaError = (_state: string) => {
    setOutOfArea(true);
  };

  const handleContinue = () => {
    if (localAddress) {
      confirmProperty();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <MapPin size={24} />
        </div>
        <h1 className={styles.title}>Get Your Free Quote</h1>
        <p className={styles.subtitle}>
          Enter your address to get an instant estimate for your roof replacement
        </p>
      </div>

      {/* Address input */}
      <div className={styles.form}>
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          onServiceAreaError={handleServiceAreaError}
          initialValue={localAddress?.formattedAddress || ''}
        />

        {/* Out of area message */}
        {outOfArea && (
          <div className={styles.outOfArea} role="alert" aria-live="polite">
            <AlertCircle size={18} aria-hidden="true" />
            <div>
              <p className={styles.outOfAreaTitle}>We don&apos;t serve that area yet</p>
              <p className={styles.outOfAreaText}>
                We currently serve Texas, Georgia, North Carolina, Arizona, and Oklahoma.
                Enter your email to be notified when we expand.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {wizardError && (
          <div className={styles.error} role="alert" aria-live="assertive">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{wizardError}</span>
          </div>
        )}

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          disabled={!localAddress || outOfArea}
          size="lg"
          className="w-full"
        >
          Get My Quote
          <ArrowRight size={18} />
        </Button>
      </div>

      {/* Trust indicators */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <span className={styles.trustCheck}>✓</span>
          No obligation
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustCheck}>✓</span>
          Instant estimate
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustCheck}>✓</span>
          Licensed & insured
        </div>
      </div>
    </div>
  );
}

export default PropertyAddress;
