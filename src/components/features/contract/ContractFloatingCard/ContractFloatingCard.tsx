'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import { SignatureCapture } from '../SignatureCapture';
import styles from './ContractFloatingCard.module.css';

interface ContractFloatingCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSigned: () => void;
  order: {
    id: string;
    quoteId: string | null;
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    selectedTier: string;
    totalPrice: number;
    customerName?: string | null;
    customerEmail?: string;
    scheduledStartDate?: string | null;
  };
  contract?: {
    id: string;
    status: string;
    signedAt: string | null;
  } | null;
}

const TIER_NAMES: Record<string, string> = {
  good: 'Essential Package',
  better: 'Premium Package',
  best: 'Elite Package',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ContractFloatingCard({
  isOpen,
  onClose,
  onSigned,
  order,
  contract,
}: ContractFloatingCardProps) {
  const [signed, setSigned] = useState(contract?.status === 'signed');

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSignatureSubmit = useCallback(async (signature: string, email: string) => {
    const quoteId = order.quoteId || order.id;
    const res = await fetch(`/api/quotes/${quoteId}/deposit-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature,
        email,
        agreedToTerms: true,
        termsVersion: '1.0',
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to sign contract');
    }

    setSigned(true);
    onSigned();
  }, [order.id, onSigned]);

  if (!isOpen) return null;

  const fullAddress = `${order.propertyAddress}, ${order.propertyCity}, ${order.propertyState}`;
  const tierName = TIER_NAMES[order.selectedTier] || order.selectedTier;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Project Contract"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FileText size={20} aria-hidden="true" />
            <h2>Project Contract</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>
          {signed ? (
            <div className={styles.signedState}>
              <CheckCircle size={48} />
              <h3>Contract Signed</h3>
              <p>Your project contract has been signed successfully. A copy has been sent to your email.</p>
              <button className={styles.doneButton} onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              {/* Contract body */}
              <div className={styles.contractBody}>
                <h3 className={styles.contractTitle}>
                  Roofing Services Agreement
                </h3>
                <p className={styles.contractDate}>
                  Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>1. Parties</h4>
                  <p>
                    This agreement is between <strong>Results Roofing LLC</strong> (&quot;Contractor&quot;) and
                    the property owner (&quot;Client&quot;) for roofing services at the following property:
                  </p>
                  <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>Property Address</span>
                    <span className={styles.infoValue}>{fullAddress}</span>
                  </div>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>2. Scope of Work</h4>
                  <p>
                    Contractor agrees to perform a complete roof replacement using the
                    selected <strong>{tierName}</strong> package, including:
                  </p>
                  <ul className={styles.scopeList}>
                    <li>Complete tear-off and disposal of existing roofing</li>
                    <li>Deck inspection and minor repairs as needed</li>
                    <li>Installation of ice &amp; water barrier at all vulnerable areas</li>
                    <li>Installation of synthetic underlayment</li>
                    <li>Installation of new drip edge, starter strip, and ridge cap</li>
                    <li>Installation of GAF architectural shingles per manufacturer specs</li>
                    <li>Cleanup and haul-away of all debris</li>
                    <li>Final inspection and walkthrough</li>
                  </ul>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>3. Project Price</h4>
                  <div className={styles.priceTable}>
                    <div className={styles.priceRow}>
                      <span>Package</span>
                      <span>{tierName}</span>
                    </div>
                    <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                      <span>Total Project Cost</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>4. Payment Terms</h4>
                  <p>
                    A deposit is required to secure the installation date and order materials.
                    The remaining balance is due upon project completion and final walkthrough approval.
                  </p>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>5. Warranty</h4>
                  <p>
                    Contractor provides a workmanship warranty for the duration specified by the
                    selected package. All manufacturer warranties on materials are transferred to
                    the property owner upon completion. Warranty details are provided in a
                    separate Certificate of Warranty document.
                  </p>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>6. Cancellation</h4>
                  <p>
                    Client may cancel this agreement within 3 business days of signing for a full
                    refund of any deposit paid. After 3 business days, the deposit is non-refundable
                    if materials have been ordered.
                  </p>
                </div>
              </div>

              {/* Signature section */}
              <div className={styles.signatureSection}>
                <SignatureCapture
                  expectedName={order.customerName || undefined}
                  onSignatureSubmit={handleSignatureSubmit}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContractFloatingCard;
