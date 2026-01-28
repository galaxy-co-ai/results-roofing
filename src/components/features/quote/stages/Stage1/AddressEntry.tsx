'use client';

import { Home } from 'lucide-react';
import { AddressAutocomplete, type ParsedAddress } from '@/components/features/address';
import styles from './Stage1.module.css';

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ', 'OK'];

interface AddressEntryProps {
  initialAddress?: string;
  onAddressSelect: (address: ParsedAddress) => void;
  onServiceAreaError?: (state: string) => void;
  isLoading?: boolean;
}

/**
 * Stage 1, Sub-step 1: Address Entry
 * 
 * User enters their address using autocomplete.
 * On valid selection, proceeds to property confirmation.
 * If outside service area, triggers onServiceAreaError callback.
 */
export function AddressEntry({
  initialAddress = '',
  onAddressSelect,
  onServiceAreaError,
  isLoading = false,
}: AddressEntryProps) {
  return (
    <div className={styles.subStep}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Home size={32} aria-hidden="true" />
        </div>
        <h1 className={styles.title}>Get Your Instant Quote</h1>
        <p className={styles.subtitle}>
          Enter your home address to see estimated pricing in seconds.
          No salesperson visit required.
        </p>
      </div>

      {/* Address Input */}
      <div className={styles.inputSection}>
        <label htmlFor="address" className={styles.label}>
          Property Address
        </label>
        <AddressAutocomplete
          onAddressSelect={onAddressSelect}
          onServiceAreaError={onServiceAreaError}
          initialValue={initialAddress}
          disabled={isLoading}
          serviceStates={SERVICE_STATES}
        />
      </div>

      {/* Service Area Notice */}
      <div className={styles.serviceArea}>
        <p className={styles.serviceAreaTitle}>Service Areas</p>
        <p className={styles.serviceAreaText}>
          We currently serve self-pay customers in{' '}
          <strong>{SERVICE_STATES.join(', ')}</strong>.
          No insurance claims accepted.
        </p>
      </div>
    </div>
  );
}

export default AddressEntry;
