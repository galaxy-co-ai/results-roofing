'use client';

import { MapPin, Package, Calendar, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { DEPOSIT_CONFIG, FINANCING_TERMS } from '@/lib/constants';
import styles from './OrderSummarySidebar.module.css';

interface SectionsComplete {
  contact: boolean;
  contract: boolean;
  signature: boolean;
  payment: boolean;
}

interface OrderSummarySidebarProps {
  address: string;
  tier: {
    tier: string;
    displayName: string;
    totalPrice: number;
    depositAmount: number;
  };
  sqft: number;
  scheduledDate?: Date;
  timeSlot?: string;
  financingTerm?: string;
  sectionsComplete?: SectionsComplete;
  className?: string;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getFinancingLabel(term: string): string {
  const termConfig = FINANCING_TERMS[term as keyof typeof FINANCING_TERMS];
  return termConfig?.label ?? term;
}

/**
 * OrderSummarySidebar - Displays order details during checkout
 * 
 * Shows:
 * - Property address
 * - Selected package
 * - Scheduled date
 * - Payment breakdown
 * - Progress checklist
 */
export function OrderSummarySidebar({
  address,
  tier,
  sqft,
  scheduledDate,
  timeSlot,
  financingTerm,
  sectionsComplete,
  className = '',
}: OrderSummarySidebarProps) {
  const depositPercent = DEPOSIT_CONFIG.percentage * 100;
  const balanceDue = tier.totalPrice - tier.depositAmount;

  return (
    <div className={`${styles.container} ${className}`}>
      <h2 className={styles.title}>Order Summary</h2>

      {/* Property */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <MapPin size={16} className={styles.sectionIcon} aria-hidden="true" />
          <span className={styles.sectionLabel}>Property</span>
        </div>
        <p className={styles.sectionValue}>{address}</p>
        <p className={styles.sectionMeta}>{sqft.toLocaleString()} sq ft roof</p>
      </div>

      {/* Package */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Package size={16} className={styles.sectionIcon} aria-hidden="true" />
          <span className={styles.sectionLabel}>Package</span>
        </div>
        <p className={styles.sectionValue}>{tier.displayName}</p>
        <p className={styles.sectionMeta}>{formatPrice(tier.totalPrice)} total</p>
      </div>

      {/* Schedule */}
      {scheduledDate && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Calendar size={16} className={styles.sectionIcon} aria-hidden="true" />
            <span className={styles.sectionLabel}>Installation Date</span>
          </div>
          <p className={styles.sectionValue}>
            {formatDate(scheduledDate)}
          </p>
          {timeSlot && (
            <p className={styles.sectionMeta}>
              {timeSlot === 'morning' ? '8:00 AM - 12:00 PM' : '12:00 PM - 5:00 PM'}
            </p>
          )}
        </div>
      )}

      {/* Payment */}
      {financingTerm && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <CreditCard size={16} className={styles.sectionIcon} aria-hidden="true" />
            <span className={styles.sectionLabel}>Payment Option</span>
          </div>
          <p className={styles.sectionValue}>{getFinancingLabel(financingTerm)}</p>
        </div>
      )}

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Price Breakdown */}
      <div className={styles.priceBreakdown}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Subtotal</span>
          <span className={styles.priceValue}>{formatPrice(tier.totalPrice)}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Deposit ({depositPercent}%)</span>
          <span className={styles.priceValue}>{formatPrice(tier.depositAmount)}</span>
        </div>
        <div className={`${styles.priceRow} ${styles.priceRow_highlight}`}>
          <span className={styles.priceLabel}>Due Today</span>
          <span className={styles.priceTotal}>{formatPrice(tier.depositAmount)}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel_muted}>Balance due on completion</span>
          <span className={styles.priceValue_muted}>{formatPrice(balanceDue)}</span>
        </div>
      </div>

      {/* Progress Checklist */}
      {sectionsComplete && (
        <>
          <hr className={styles.divider} />
          <div className={styles.progress}>
            <h3 className={styles.progressTitle}>Checkout Progress</h3>
            <ul className={styles.progressList}>
              <li className={`${styles.progressItem} ${sectionsComplete.contact ? styles.progressItem_complete : ''}`}>
                {sectionsComplete.contact ? (
                  <CheckCircle size={16} className={styles.progressIcon_complete} aria-hidden="true" />
                ) : (
                  <Clock size={16} className={styles.progressIcon} aria-hidden="true" />
                )}
                <span>Contact info</span>
              </li>
              <li className={`${styles.progressItem} ${sectionsComplete.contract ? styles.progressItem_complete : ''}`}>
                {sectionsComplete.contract ? (
                  <CheckCircle size={16} className={styles.progressIcon_complete} aria-hidden="true" />
                ) : (
                  <Clock size={16} className={styles.progressIcon} aria-hidden="true" />
                )}
                <span>Contract review</span>
              </li>
              <li className={`${styles.progressItem} ${sectionsComplete.signature ? styles.progressItem_complete : ''}`}>
                {sectionsComplete.signature ? (
                  <CheckCircle size={16} className={styles.progressIcon_complete} aria-hidden="true" />
                ) : (
                  <Clock size={16} className={styles.progressIcon} aria-hidden="true" />
                )}
                <span>Signature</span>
              </li>
              <li className={`${styles.progressItem} ${sectionsComplete.payment ? styles.progressItem_complete : ''}`}>
                {sectionsComplete.payment ? (
                  <CheckCircle size={16} className={styles.progressIcon_complete} aria-hidden="true" />
                ) : (
                  <Clock size={16} className={styles.progressIcon} aria-hidden="true" />
                )}
                <span>Payment</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* Trust badges */}
      <div className={styles.trustBadges}>
        <div className={styles.badge}>
          <CheckCircle size={14} aria-hidden="true" />
          <span>3-day cancellation policy</span>
        </div>
        <div className={styles.badge}>
          <CheckCircle size={14} aria-hidden="true" />
          <span>Secure payment</span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummarySidebar;
