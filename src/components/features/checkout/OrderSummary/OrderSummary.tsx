'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './OrderSummary.module.css';

interface QuoteData {
  id: string;
  address: string;
  packageName: string;
  packageTier: 'good' | 'better' | 'best';
  totalPrice: number;
  depositAmount: number;
  warranty: string;
  shingleType: string;
  roofSqft: number;
  installDate?: string;
}

interface OrderSummaryProps {
  /** Quote data to display */
  quote: QuoteData;
  /** Display mode */
  variant?: 'sidebar' | 'collapsible';
  /** Additional CSS class */
  className?: string;
}

/**
 * Format currency for display
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Order summary component for checkout
 * Displays quote details in sidebar or collapsible format
 */
export function OrderSummary({
  quote,
  variant = 'sidebar',
  className = '',
}: OrderSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const balance = quote.totalPrice - quote.depositAmount;

  if (variant === 'collapsible') {
    return (
      <div className={`${styles.collapsible} ${className}`.trim()}>
        <button
          type="button"
          className={styles.collapsibleHeader}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className={styles.collapsibleTitle}>
            Order Summary
          </span>
          <span className={styles.collapsibleTotal}>
            {formatPrice(quote.totalPrice)}
            {expanded ? (
              <ChevronUp size={20} aria-hidden="true" />
            ) : (
              <ChevronDown size={20} aria-hidden="true" />
            )}
          </span>
        </button>

        {expanded && (
          <div className={styles.collapsibleContent}>
            <SummaryContent quote={quote} balance={balance} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.sidebar} ${className}`.trim()}>
      <h3 className={styles.title}>Order Summary</h3>
      <SummaryContent quote={quote} balance={balance} />
    </div>
  );
}

interface SummaryContentProps {
  quote: QuoteData;
  balance: number;
}

function SummaryContent({ quote, balance }: SummaryContentProps) {
  return (
    <>
      {/* Property */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Property</h4>
        <p className={styles.address}>{quote.address}</p>
        <p className={styles.detail}>{quote.roofSqft.toLocaleString()} sq ft</p>
      </div>

      {/* Package */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Package</h4>
        <div className={styles.packageRow}>
          <span className={styles.packageName}>{quote.packageName}</span>
          <span className={styles.packageTier}>
            {quote.packageTier.charAt(0).toUpperCase() + quote.packageTier.slice(1)}
          </span>
        </div>
        <p className={styles.detail}>{quote.shingleType}</p>
        <p className={styles.detail}>{quote.warranty}</p>
      </div>

      {/* Installation */}
      {quote.installDate && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Installation Date</h4>
          <p className={styles.detail}>{quote.installDate}</p>
        </div>
      )}

      {/* Pricing */}
      <div className={styles.pricing}>
        <div className={styles.priceRow}>
          <span>Total Price</span>
          <span className={styles.priceValue}>{formatPrice(quote.totalPrice)}</span>
        </div>
        <div className={styles.priceRow}>
          <span>Deposit Due Today</span>
          <span className={styles.priceValue}>{formatPrice(quote.depositAmount)}</span>
        </div>
        <div className={`${styles.priceRow} ${styles.balance}`}>
          <span>Balance Due at Completion</span>
          <span className={styles.priceValue}>{formatPrice(balance)}</span>
        </div>
      </div>
    </>
  );
}

export default OrderSummary;
