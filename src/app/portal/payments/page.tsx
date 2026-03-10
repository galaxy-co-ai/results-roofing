'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { EmptyStateLocked } from '@/components/features/portal/EmptyStateLocked/EmptyStateLocked';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { PortalPhase } from '@/lib/portal/phases';
import { PaymentDrawer, type PaymentType } from '@/components/features/checkout/PaymentDrawer';
import { PaymentProgressCard, PaymentProgressCardSkeleton } from '@/components/features/portal/PaymentProgressCard';
import { PaymentOptionCard, PaymentOptionCardSkeleton } from '@/components/features/portal/PaymentOptionCard';
import { PaymentHistoryTable, PaymentHistoryTableSkeleton } from '@/components/features/portal/PaymentHistoryTable';
import { InvoiceCard } from '@/components/features/portal/InvoiceCard';
import { funnelTracker } from '@/lib/analytics';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

function PaymentsSkeleton() {
  return (
    <div className={styles.page}>
      <PortalHeader title="Payments" />
      <PaymentProgressCardSkeleton />
      <div className={styles.optionsGrid}>
        <PaymentOptionCardSkeleton />
        <PaymentOptionCardSkeleton />
        <PaymentOptionCardSkeleton />
      </div>
      <PaymentHistoryTableSkeleton />
    </div>
  );
}

/** Quote-only view — shows deposit amount when no order exists yet */
function PendingQuotePayments({ email }: { email: string }) {
  const { quote } = usePortalPhase(email);

  if (!quote) return null;

  const totalPrice = quote.totalPrice ?? 0;
  const depositAmount = quote.depositAmount ?? Math.round(totalPrice * 0.05);

  return (
    <div className={styles.pendingPayments}>
      <div className={styles.pendingCard}>
        <h2 className={styles.pendingTitle}>Your Deposit</h2>
        <p className={styles.pendingDescription}>
          A deposit of <strong>${depositAmount.toLocaleString()}</strong> secures your installation date
          and covers material ordering.
        </p>
        <div className={styles.pendingDetails}>
          <div className={styles.pendingRow}>
            <span>Project total</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
          <div className={styles.pendingRow}>
            <span>Deposit due</span>
            <strong>${depositAmount.toLocaleString()}</strong>
          </div>
          <div className={styles.pendingRow}>
            <span>Balance after deposit</span>
            <span>${(totalPrice - depositAmount).toLocaleString()}</span>
          </div>
        </div>
        <p className={styles.pendingNote}>
          Payment will be available once your consultation is confirmed.
          You can pay by credit card, debit card, or bank transfer.
        </p>
      </div>
    </div>
  );
}

/** Phase 3+ ledger — preserves all existing payment flow logic */
function PaymentsLedger({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const { order, details } = usePortalPhase(email);
  const orderId = order?.id ?? null;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('deposit');
  const [selectedAmount, setSelectedAmount] = useState(0);

  const { data: invoiceData } = useQuery({
    queryKey: ['invoices', orderId],
    queryFn: async () => {
      const res = await fetch(`/api/invoices?orderId=${orderId}`);
      if (!res.ok) return { invoices: [] };
      return res.json();
    },
    enabled: !!orderId,
  });

  const invoiceList = invoiceData?.invoices || [];

  if (!details && !order) {
    // No order yet — show deposit info from pending quote
    return <PendingQuotePayments email={email} />;
  }

  if (!details || !order) {
    return (
      <div className={styles.errorState} role="alert">
        <AlertCircle size={48} className={styles.errorIcon} />
        <h2 className={styles.errorTitle}>Unable to load payment information</h2>
        <p className={styles.errorText}>Please try refreshing the page.</p>
      </div>
    );
  }

  const { payments } = details;
  const orderDetail = details.order;

  const hasDeposit = payments.some(
    (p) => p.type === 'deposit' && p.status === 'succeeded'
  );
  const isPaidInFull = orderDetail.totalPaid >= orderDetail.totalPrice;
  const lastSucceeded = payments.find((p) => p.status === 'succeeded');
  const depositAmount = orderDetail.depositAmount || Math.round(orderDetail.totalPrice * 0.05);
  const cardBrand = (lastSucceeded as any)?.cardBrand || null;
  const cardLast4 = (lastSucceeded as any)?.cardLast4 || null;

  function handlePaymentClick(type: PaymentType, amount: number) {
    setSelectedPaymentType(type);
    setSelectedAmount(amount);
    setDrawerOpen(true);
  }

  function handlePaymentSuccess() {
    // Analytics: portal payment succeeded
    funnelTracker.paymentMade({
      quoteId: orderDetail.quoteId || '',
      paymentType: selectedPaymentType,
      amount: selectedAmount,
    });

    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  }

  function handleDownloadReceipt(paymentId: string) {
    window.open(`/api/portal/receipts/${paymentId}`, '_blank');
  }

  return (
    <>
      {/* Ledger Summary */}
      <section aria-label="Payment progress">
        <PaymentProgressCard
          totalPrice={orderDetail.totalPrice}
          totalPaid={orderDetail.totalPaid}
          balance={orderDetail.balance}
          cardBrand={cardBrand}
          cardLast4={cardLast4}
        />
      </section>

      {/* Invoices */}
      {invoiceList.length > 0 && (
        <section aria-label="Invoices" className={styles.invoicesSection}>
          <h2 className={styles.sectionTitle}>Invoices</h2>
          <div className={styles.invoicesList}>
            {invoiceList.map((inv: any) => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>
        </section>
      )}

      {/* Payment Options */}
      <section aria-label="Payment options" className={styles.optionsGrid}>
        <PaymentOptionCard
          type="deposit"
          label="Deposit"
          amount={depositAmount}
          description="Secure your installation date"
          isPaid={hasDeposit}
          paidDate={
            hasDeposit
              ? (payments.find((p) => p.type === 'deposit' && p.status === 'succeeded') as any)
                  ?.processedAt || null
              : null
          }
          variant={!hasDeposit && !isPaidInFull ? 'primary' : 'outline'}
          onPay={() => handlePaymentClick('deposit', depositAmount)}
          onDownloadReceipt={() => {
            const dp = payments.find(
              (p) => p.type === 'deposit' && p.status === 'succeeded'
            );
            if (dp) handleDownloadReceipt(dp.id);
          }}
        />
        <PaymentOptionCard
          type="balance"
          label="Pay in full"
          amount={hasDeposit ? orderDetail.balance : orderDetail.totalPrice}
          description={hasDeposit ? 'Pay remaining balance' : 'Pay your entire balance'}
          isPaid={isPaidInFull}
          paidDate={
            isPaidInFull
              ? (payments.find((p) => p.type === 'balance' && p.status === 'succeeded') as any)
                  ?.processedAt || null
              : null
          }
          variant={hasDeposit && !isPaidInFull ? 'primary' : 'outline'}
          onPay={() =>
            handlePaymentClick(
              hasDeposit ? 'balance' : 'full',
              hasDeposit ? orderDetail.balance : orderDetail.totalPrice
            )
          }
          onDownloadReceipt={() => {
            const bp = payments.find(
              (p) => p.type === 'balance' && p.status === 'succeeded'
            );
            if (bp) handleDownloadReceipt(bp.id);
          }}
        />
        <PaymentOptionCard
          type="financing"
          label="Financing"
          amount={null}
          description="Flexible payment plans — coming soon"
          isPaid={false}
          variant="outline"
          disabled
          badge="Coming soon"
        />
      </section>

      {/* Payment History */}
      <section aria-label="Payment history">
        <PaymentHistoryTable
          payments={payments}
          onDownloadReceipt={handleDownloadReceipt}
        />
      </section>

      {/* Payment Drawer */}
      {orderDetail.quoteId && (
        <PaymentDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          quoteId={orderDetail.quoteId}
          paymentType={selectedPaymentType}
          amount={selectedAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

function PaymentsContent({ email }: { email: string | null }) {
  const { phase, isLoading } = usePortalPhase(email);

  if (isLoading) return <PaymentsSkeleton />;

  const isLocked = !phase || phase.phase <= PortalPhase.QUOTED;

  return (
    <div className={styles.page}>
      <PortalHeader title="Payments" />
      {isLocked ? (
        <EmptyStateLocked
          title="No Payment Information"
          description={
            phase?.phase === PortalPhase.QUOTED
              ? 'Sign your contract to unlock payment options.'
              : 'Complete your quote to see your project pricing.'
          }
          currentStep={phase?.checklistStep ?? 1}
          ctaLabel={
            phase?.phase === PortalPhase.QUOTED ? 'Review Contract' : 'Start Your Quote'
          }
          ctaHref="/portal"
        />
      ) : (
        email && <PaymentsLedger email={email} />
      )}
    </div>
  );
}

function ClerkPayments() {
  const { user } = useUser();
  return <PaymentsContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevPayments() {
  return <PaymentsContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

export default function PaymentsPage() {
  if (DEV_BYPASS_ENABLED) return <DevPayments />;
  return <ClerkPayments />;
}
