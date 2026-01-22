import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CreditCard, Lock, Shield } from 'lucide-react';
import { db, schema, eq } from '@/db/index';
import styles from './page.module.css';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id: quoteId } = await params;

  const [quote, pricingTiers] = await Promise.all([
    db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    }),
    db.query.pricingTiers.findMany({
      where: eq(schema.pricingTiers.isActive, true),
    }),
  ]);

  if (!quote || !quote.selectedTier) {
    notFound();
  }

  const selectedTier = pricingTiers.find((t) => t.tier === quote.selectedTier);
  const totalPrice = quote.totalPrice ? parseFloat(quote.totalPrice) : 0;
  const depositAmount = quote.depositAmount ? parseFloat(quote.depositAmount) : 0;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href={`/quote/${quoteId}/contract`} className={styles.backLink}>
          <ChevronLeft size={18} />
          Back to Contract
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <CreditCard size={32} />
          </div>
          <h1 className={styles.title}>Complete Your Payment</h1>
          <p className={styles.subtitle}>
            Pay your deposit to confirm your installation date.
          </p>
        </div>

        {/* Order Summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{selectedTier?.displayName} Package</span>
            <span className={styles.summaryValue}>{formatCurrency(totalPrice)}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryRow}>
            <span className={styles.depositLabel}>Deposit Due Today</span>
            <span className={styles.depositAmount}>{formatCurrency(depositAmount)}</span>
          </div>

          <p className={styles.balanceNote}>
            Balance of {formatCurrency(totalPrice - depositAmount)} due upon completion
          </p>
        </div>

        {/* Payment Form Placeholder */}
        <div className={styles.paymentForm}>
          <h3 className={styles.formTitle}>Payment Details</h3>

          {/* Card Number */}
          <div className={styles.inputGroup}>
            <label htmlFor="cardNumber" className={styles.inputLabel}>
              Card Number
            </label>
            <div className={styles.cardInputWrapper}>
              <input
                id="cardNumber"
                type="text"
                className={styles.input}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                aria-label="Card number"
              />
              <CreditCard size={20} className={styles.cardIcon} />
            </div>
          </div>

          {/* Expiry and CVC */}
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="expiry" className={styles.inputLabel}>
                Expiry Date
              </label>
              <input
                id="expiry"
                type="text"
                className={styles.input}
                placeholder="MM / YY"
                maxLength={7}
                aria-label="Expiry date"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="cvc" className={styles.inputLabel}>
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                className={styles.input}
                placeholder="123"
                maxLength={4}
                aria-label="CVC security code"
              />
            </div>
          </div>

          {/* Name on Card */}
          <div className={styles.inputGroup}>
            <label htmlFor="cardName" className={styles.inputLabel}>
              Name on Card
            </label>
            <input
              id="cardName"
              type="text"
              className={styles.input}
              placeholder="John Smith"
              aria-label="Name on card"
            />
          </div>

          {/* Billing ZIP */}
          <div className={styles.inputGroup}>
            <label htmlFor="billingZip" className={styles.inputLabel}>
              Billing ZIP Code
            </label>
            <input
              id="billingZip"
              type="text"
              className={styles.input}
              placeholder="12345"
              maxLength={10}
              aria-label="Billing ZIP code"
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className={styles.securityNotice}>
          <Lock size={16} className={styles.securityIcon} />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>

        {/* Pay Button */}
        <Link href={`/quote/${quoteId}/confirmation`} className={styles.payButton}>
          Pay {formatCurrency(depositAmount)}
          <ChevronRight size={20} />
        </Link>

        {/* Trust Signals */}
        <div className={styles.trustSignals}>
          <div className={styles.trustItem}>
            <Shield size={18} className={styles.trustIcon} />
            <span>3-day cancellation policy</span>
          </div>
          <div className={styles.trustItem}>
            <CreditCard size={18} className={styles.trustIcon} />
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>
    </main>
  );
}
