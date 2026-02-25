'use client';

import { CreditCard } from 'lucide-react';

interface PaymentProgressCardProps {
  totalPrice: number;
  totalPaid: number;
  balance: number;
  cardBrand?: string | null;
  cardLast4?: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentProgressCard({
  totalPrice,
  totalPaid,
  balance,
  cardBrand,
  cardLast4,
}: PaymentProgressCardProps) {
  const percentPaid = totalPrice > 0 ? (totalPaid / totalPrice) * 100 : 0;
  const isPaidInFull = balance <= 0;

  const paymentMethodDisplay = cardBrand && cardLast4
    ? `${cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} •••• ${cardLast4}`
    : 'No payment method on file';

  return (
    <div className="rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div>
            <span className="block text-xs uppercase tracking-wider text-[var(--rr-color-text-tertiary)] mb-1">
              Total cost
            </span>
            <span className="block text-xl font-semibold tabular-nums text-[var(--rr-color-text-primary)]">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-[var(--rr-color-text-tertiary)] mb-1">
              Amount paid
            </span>
            <span className="block text-xl font-semibold tabular-nums text-[var(--rr-color-success)]">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-[var(--rr-color-text-tertiary)] mb-1">
              Remaining balance
            </span>
            <span className={`block text-xl font-semibold tabular-nums ${isPaidInFull ? 'text-[var(--rr-color-success)]' : 'text-[var(--rr-color-blue)]'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--rr-color-text-secondary)]">Payment progress</span>
          <span className="text-sm font-semibold tabular-nums text-[var(--rr-color-blue)]">{percentPaid.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--rr-color-bg-secondary)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--rr-color-blue)] transition-[width] duration-300"
            style={{ width: `${Math.min(percentPaid, 100)}%` }}
          />
        </div>
      </div>

      {/* Payment method */}
      <div className="flex items-center gap-2 text-sm text-[var(--rr-color-text-secondary)]">
        <CreditCard size={16} />
        <span>{paymentMethodDisplay}</span>
      </div>
    </div>
  );
}

export function PaymentProgressCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-6 shadow-sm animate-pulse">
      <div className="grid grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 w-16 bg-[var(--rr-color-bg-tertiary)] rounded mb-2" />
            <div className="h-7 w-24 bg-[var(--rr-color-bg-tertiary)] rounded" />
          </div>
        ))}
      </div>
      <div className="h-2 rounded-full bg-[var(--rr-color-bg-tertiary)] mb-4" />
      <div className="h-4 w-48 bg-[var(--rr-color-bg-tertiary)] rounded" />
    </div>
  );
}
