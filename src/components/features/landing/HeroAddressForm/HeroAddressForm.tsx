'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { AddressAutocomplete, type ParsedAddress } from '@/components/features/address/AddressAutocomplete';
import styles from './HeroAddressForm.module.css';

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ', 'OK'];

interface HeroAddressFormProps {
  className?: string;
}

/**
 * HeroAddressForm - Landing page address autocomplete with quote creation
 * Refactored for premium enterprise look and improved UX.
 */
export function HeroAddressForm({ className = '' }: HeroAddressFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfAreaState, setOutOfAreaState] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<ParsedAddress | null>(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const handleAddressSelect = useCallback((address: ParsedAddress) => {
    setError(null);
    setOutOfAreaState(null);
    setSelectedAddress(address);
    setShowAddressPrompt(false);
  }, []);

  const handleEditAddress = () => {
    setSelectedAddress(null);
    setError(null);
  };

  const handleGetQuote = () => {
    // If no address selected, focus the input and show prompt
    if (!selectedAddress) {
      setShowAddressPrompt(true);
      // Find and focus the input
      const input = inputContainerRef.current?.querySelector('input');
      if (input) {
        input.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Store address in sessionStorage for the quote wizard to pick up
      sessionStorage.setItem('pendingAddress', JSON.stringify(selectedAddress));

      // Navigate to quote wizard with prefilled flag - shows property confirmation step
      router.push('/quote/new?prefilled=true');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start quote';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleServiceAreaError = useCallback((state: string) => {
    setOutOfAreaState(state);
    setSelectedAddress(null);
  }, []);

  return (
    <div className={`${styles.card} ${className}`}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerText}>
          <h2 className={styles.cardTitle}>Get Started Here</h2>
          <p className={styles.cardSubtitle}>
            No Credit Card Required
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <div className={styles.formWrapper}>
          
          {selectedAddress ? (
            <div className={styles.selectedAddressPreview}>
              <div className={styles.addressInfo}>
                <CheckCircle size={18} className={styles.successIcon} />
                <div className={styles.addressStack}>
                  <span className={styles.confirmLabel}>We found</span>
                  <span className={styles.addressText}>{selectedAddress.formattedAddress}</span>
                </div>
              </div>
              <button 
                onClick={handleEditAddress}
                className={styles.editLink}
                type="button"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className={styles.inputContainer} ref={inputContainerRef}>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                onServiceAreaError={handleServiceAreaError}
                disabled={isSubmitting}
                initialValue=""
              />
              {showAddressPrompt && (
                <p className={styles.addressPrompt}>
                  Please enter your address above to continue
                </p>
              )}
            </div>
          )}

          {/* Primary CTA */}
          <button
            onClick={handleGetQuote}
            className={`${styles.primaryButton} ${selectedAddress ? styles.primaryButtonReady : ''}`}
            disabled={isSubmitting}
            type="button"
            aria-label={isSubmitting ? 'Generating estimate' : 'Get my quote'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={styles.spinner} size={20} />
                Generating estimate...
              </>
            ) : (
              <>
                Get my quote
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {outOfAreaState && !error && (
          <div className={styles.outOfArea}>
            <p className={styles.outOfAreaTitle}>
              We don&apos;t serve {outOfAreaState} yet
            </p>
            <p className={styles.outOfAreaText}>
              Enter your email and we&apos;ll notify you when we expand to your area.
            </p>
            {/* Notification form could be extracted or kept simple */}
            <form
              className={styles.notifyForm}
              onSubmit={(e) => {
                e.preventDefault();
                setOutOfAreaState(null);
              }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className={styles.notifyInput}
                aria-label="Email for expansion notification"
                required
              />
              <button type="submit" className={styles.notifyButton}>
                Notify Me
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.serviceArea}>
          <span className={styles.serviceAreaLabel}>Serving:</span>
          <span className={styles.serviceAreaStates}>{SERVICE_STATES.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}

export default HeroAddressForm;
