'use client';

import { MapPin, Calendar, Package, Phone, CreditCard } from 'lucide-react';
import { useWizardData } from './WizardContext';
import styles from './WizardSidebar.module.css';

/**
 * Format a date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format time slot for display
 */
function formatTimeSlot(slot: 'morning' | 'afternoon' | null): string {
  if (!slot) return '';
  return slot === 'morning' ? '8:00 AM - 12:00 PM' : '12:00 PM - 5:00 PM';
}

/**
 * Format price for display
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get tier display name
 */
function getTierDisplayName(tier: 'good' | 'better' | 'best' | null): string {
  switch (tier) {
    case 'good':
      return 'Good';
    case 'better':
      return 'Better';
    case 'best':
      return 'Best';
    default:
      return '';
  }
}

/**
 * Desktop sidebar showing order summary
 */
export function WizardSidebar() {
  const { context, state } = useWizardData();
  const {
    address,
    selectedTier,
    priceRanges,
    scheduledDate,
    timeSlot,
    phone,
    sqftEstimate,
  } = context;

  // Find selected tier price range
  const selectedPriceRange = priceRanges?.find(
    (range) => range.tier === selectedTier
  );

  // Calculate deposit (typically 10% of estimate)
  const depositAmount = selectedPriceRange
    ? Math.round(selectedPriceRange.priceEstimate * 0.1)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 className={styles.title}>Order Summary</h3>

        <div className={styles.items}>
          {/* Address */}
          {address && (
            <div className={styles.item}>
              <div className={styles.itemIcon}>
                <MapPin size={16} />
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>Property</div>
                <div className={styles.itemValue}>
                  {address.streetAddress}
                  <br />
                  <span className={styles.itemSubvalue}>
                    {address.city}, {address.state} {address.zip}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Square footage estimate */}
          {sqftEstimate && sqftEstimate > 0 && (
            <div className={styles.item}>
              <div className={styles.itemIcon}>
                <Package size={16} />
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>Estimated Roof Size</div>
                <div className={styles.itemValue}>
                  ~{sqftEstimate.toLocaleString()} sq ft
                </div>
              </div>
            </div>
          )}

          {/* Selected package */}
          {selectedTier && selectedPriceRange && (
            <div className={styles.item}>
              <div className={styles.itemIcon}>
                <Package size={16} />
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>Package</div>
                <div className={styles.itemValue}>
                  {getTierDisplayName(selectedTier)}
                  <span className={styles.itemSubvalue}>
                    {formatPrice(selectedPriceRange.priceMin)} -{' '}
                    {formatPrice(selectedPriceRange.priceMax)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled date */}
          {scheduledDate && (
            <div className={styles.item}>
              <div className={styles.itemIcon}>
                <Calendar size={16} />
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>Inspection</div>
                <div className={styles.itemValue}>
                  {formatDate(scheduledDate)}
                  {timeSlot && (
                    <span className={styles.itemSubvalue}>
                      {formatTimeSlot(timeSlot)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact info */}
          {phone && (
            <div className={styles.item}>
              <div className={styles.itemIcon}>
                <Phone size={16} />
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>Contact</div>
                <div className={styles.itemValue}>{phone}</div>
              </div>
            </div>
          )}
        </div>

        {/* Deposit summary (show when we have a tier selected) */}
        {selectedTier && depositAmount > 0 && (
          <div className={styles.depositSection}>
            <div className={styles.depositRow}>
              <span>Deposit due today</span>
              <span className={styles.depositAmount}>
                {formatPrice(depositAmount)}
              </span>
            </div>
            <p className={styles.depositNote}>
              Remaining balance due after inspection
            </p>
          </div>
        )}

        {/* Secure payment note */}
        {state === 'payment' && (
          <div className={styles.securityNote}>
            <CreditCard size={14} />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        )}
      </div>

      {/* Trust indicators */}
      <div className={styles.trustIndicators}>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✓</span>
          <span>Licensed & Insured</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✓</span>
          <span>5-Year Workmanship Warranty</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✓</span>
          <span>Free 3-Day Cancellation</span>
        </div>
      </div>
    </div>
  );
}

export default WizardSidebar;
