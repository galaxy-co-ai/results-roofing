'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useOrders, useOrderDetails } from '@/hooks';
import { PaymentDrawer, type PaymentType } from '@/components/features/checkout/PaymentDrawer';
import { PaymentProgressCard, PaymentProgressCardSkeleton } from '@/components/features/portal/PaymentProgressCard';
import { PaymentOptionCard, PaymentOptionCardSkeleton } from '@/components/features/portal/PaymentOptionCard';
import { PaymentHistoryTable, PaymentHistoryTableSkeleton } from '@/components/features/portal/PaymentHistoryTable';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

function PaymentsSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto">
      <header className="mb-8">
        <div className="h-8 w-40 bg-[var(--rr-color-bg-tertiary)] rounded animate-pulse mb-2" />
        <div className="h-5 w-72 bg-[var(--rr-color-bg-tertiary)] rounded animate-pulse" />
      </header>
      <PaymentProgressCardSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <PaymentOptionCardSkeleton />
        <PaymentOptionCardSkeleton />
        <PaymentOptionCardSkeleton />
      </div>
      <PaymentHistoryTableSkeleton />
    </div>
  );
}

function NoOrderState() {
  return (
    <div className="max-w-[1100px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Payments</h1>
        <p className="text-[var(--rr-color-text-secondary)] mt-1">
          Manage your project payments and view transaction history
        </p>
      </header>
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)]">
        <AlertCircle size={48} className="text-[var(--rr-color-text-tertiary)] mb-3" />
        <p className="text-base font-medium text-[var(--rr-color-text-secondary)]">
          Complete your quote to see payment options
        </p>
        <a
          href="/quote/new"
          className="mt-4 inline-flex items-center rounded-lg bg-[var(--rr-color-blue)] px-4 py-2.5 text-sm font-semibold text-white hover-hover:hover:bg-[var(--rr-color-brand-primary-active)] active:scale-[0.97] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--rr-color-blue)]"
        >
          Start a quote
        </a>
      </div>
    </div>
  );
}

function PaymentsContent({ userEmail, userLoaded }: { userEmail: string | null; userLoaded: boolean }) {
  const queryClient = useQueryClient();
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders(userEmail);
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;
  const { data: orderDetails, isLoading: detailsLoading, error: detailsError } = useOrderDetails(currentOrderId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('deposit');
  const [selectedAmount, setSelectedAmount] = useState(0);

  function handlePaymentClick(type: PaymentType, amount: number) {
    setSelectedPaymentType(type);
    setSelectedAmount(amount);
    setDrawerOpen(true);
  }

  function handlePaymentSuccess() {
    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order', currentOrderId] });
  }

  function handleDownloadReceipt(paymentId: string) {
    window.open(`/api/portal/receipts/${paymentId}`, '_blank');
  }

  if (!userLoaded || ordersLoading || (currentOrderId && detailsLoading)) {
    return <PaymentsSkeleton />;
  }

  if (ordersError || detailsError) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
          <AlertCircle size={48} className="text-[var(--rr-color-text-tertiary)] mb-3" />
          <h2 className="text-lg font-semibold text-[var(--rr-color-text-primary)]">Unable to load payment information</h2>
          <p className="text-sm text-[var(--rr-color-text-secondary)] mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!currentOrderId || !orderDetails) {
    return <NoOrderState />;
  }

  const { order, payments } = orderDetails;

  // Smart state logic
  const hasDeposit = payments.some(
    (p: { type: string; status: string }) => p.type === 'deposit' && p.status === 'succeeded'
  );
  const isPaidInFull = order.totalPaid >= order.totalPrice;

  // Find most recent succeeded payment for card display
  const lastSucceeded = payments.find((p: { status: string }) => p.status === 'succeeded');

  // Deposit amount is 5% of total
  const depositAmount = order.depositAmount || Math.round(order.totalPrice * 0.05);

  // Card details from the order details payments (need to check if they're returned)
  // The API currently returns id, amount, status, type, processedAt
  // We need cardBrand and cardLast4 — for now use what we have
  const cardBrand = (lastSucceeded as { cardBrand?: string })?.cardBrand || null;
  const cardLast4 = (lastSucceeded as { cardLast4?: string })?.cardLast4 || null;

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Payments</h1>
        <p className="text-[var(--rr-color-text-secondary)] mt-1">
          Manage your project payments and view transaction history
        </p>
      </header>

      {/* Progress Card */}
      <section aria-label="Payment progress">
        <PaymentProgressCard
          totalPrice={order.totalPrice}
          totalPaid={order.totalPaid}
          balance={order.balance}
          cardBrand={cardBrand}
          cardLast4={cardLast4}
        />
      </section>

      {/* Payment Options — 3 column grid */}
      <section aria-label="Payment options" className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <PaymentOptionCard
          type="deposit"
          label="Deposit"
          amount={depositAmount}
          description="Secure your installation date"
          isPaid={hasDeposit}
          paidDate={hasDeposit ? (payments.find((p: { type: string; status: string }) => p.type === 'deposit' && p.status === 'succeeded') as { processedAt?: string })?.processedAt || null : null}
          variant={!hasDeposit && !isPaidInFull ? 'primary' : 'outline'}
          onPay={() => handlePaymentClick('deposit', depositAmount)}
          onDownloadReceipt={() => {
            const depositPayment = payments.find((p: { type: string; status: string }) => p.type === 'deposit' && p.status === 'succeeded');
            if (depositPayment) handleDownloadReceipt(depositPayment.id);
          }}
        />
        <PaymentOptionCard
          type="balance"
          label="Pay in full"
          amount={hasDeposit ? order.balance : order.totalPrice}
          description={hasDeposit ? 'Pay remaining balance' : 'Pay your entire balance'}
          isPaid={isPaidInFull}
          paidDate={isPaidInFull ? (payments.find((p: { type: string; status: string }) => p.type === 'balance' && p.status === 'succeeded') as { processedAt?: string })?.processedAt || null : null}
          variant={hasDeposit && !isPaidInFull ? 'primary' : 'outline'}
          onPay={() => handlePaymentClick(
            hasDeposit ? 'balance' : 'full',
            hasDeposit ? order.balance : order.totalPrice
          )}
          onDownloadReceipt={() => {
            const balancePayment = payments.find((p: { type: string; status: string }) => p.type === 'balance' && p.status === 'succeeded');
            if (balancePayment) handleDownloadReceipt(balancePayment.id);
          }}
        />
        <PaymentOptionCard
          type="financing"
          label="Financing"
          amount={null}
          description="Flexible payment plans through Wisetack"
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
      {order.quoteId && (
        <PaymentDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          quoteId={order.quoteId}
          paymentType={selectedPaymentType}
          amount={selectedAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

function ClerkPayments() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  return <PaymentsContent userEmail={userEmail} userLoaded={isLoaded} />;
}

function DevPayments() {
  const userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  return <PaymentsContent userEmail={userEmail} userLoaded={true} />;
}

export default function PaymentsPage() {
  if (DEV_BYPASS_ENABLED) {
    return <DevPayments />;
  }
  return <ClerkPayments />;
}
