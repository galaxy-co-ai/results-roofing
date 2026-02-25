'use client';

import { CheckCircle, Download } from 'lucide-react';

export type PaymentOptionType = 'deposit' | 'balance' | 'financing';

interface PaymentOptionCardProps {
  type: PaymentOptionType;
  label: string;
  amount: number | null;
  description: string;
  isPaid: boolean;
  paidDate?: string | null;
  variant: 'primary' | 'outline';
  disabled?: boolean;
  badge?: string;
  onPay?: () => void;
  onDownloadReceipt?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PaymentOptionCard({
  label,
  amount,
  description,
  isPaid,
  paidDate,
  variant,
  disabled,
  badge,
  onPay,
  onDownloadReceipt,
}: PaymentOptionCardProps) {
  const borderColor = isPaid
    ? 'border-[var(--rr-color-success)]'
    : variant === 'primary'
    ? 'border-[var(--rr-color-blue)]'
    : 'border-[var(--rr-color-border-default)]';

  return (
    <div
      className={`rounded-xl border ${borderColor} bg-[var(--rr-color-white)] p-5 shadow-sm flex flex-col gap-3 ${disabled ? 'opacity-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider text-[var(--rr-color-text-secondary)]">
          {label}
        </span>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-[var(--rr-color-bg-tertiary)] px-2.5 py-0.5 text-xs font-medium text-[var(--rr-color-text-tertiary)]">
            {badge}
          </span>
        )}
      </div>

      {/* Amount */}
      {amount !== null && (
        <span className="text-2xl font-bold tabular-nums text-[var(--rr-color-text-primary)]">
          {formatCurrency(amount)}
        </span>
      )}

      {/* Description */}
      <p className="text-sm text-[var(--rr-color-text-secondary)] leading-relaxed">
        {description}
      </p>

      {/* CTA or Paid state */}
      {isPaid ? (
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--rr-color-success)]">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">
              Paid{paidDate ? ` on ${formatDate(paidDate)}` : ''}
            </span>
          </div>
          {onDownloadReceipt && (
            <button
              onClick={onDownloadReceipt}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--rr-color-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-blue)] rounded"
            >
              <Download size={14} />
              Download receipt
            </button>
          )}
        </div>
      ) : (
        <div className="mt-auto pt-2">
          {!disabled ? (
            <button
              onClick={onPay}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                variant === 'primary'
                  ? 'bg-[var(--rr-color-blue)] text-white hover:bg-[#1D4ED8] focus-visible:ring-[var(--rr-color-blue)]'
                  : 'border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] text-[var(--rr-color-text-primary)] hover:bg-[var(--rr-color-bg-tertiary)] focus-visible:ring-[var(--rr-color-blue)]'
              }`}
            >
              {label === 'Deposit' ? 'Pay deposit' : 'Pay balance'}
            </button>
          ) : (
            <button
              disabled
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-tertiary)] text-[var(--rr-color-text-tertiary)] cursor-not-allowed"
            >
              Coming soon
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PaymentOptionCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-5 shadow-sm animate-pulse flex flex-col gap-3">
      <div className="h-3 w-16 bg-[var(--rr-color-bg-tertiary)] rounded" />
      <div className="h-8 w-24 bg-[var(--rr-color-bg-tertiary)] rounded" />
      <div className="h-4 w-full bg-[var(--rr-color-bg-tertiary)] rounded" />
      <div className="mt-auto h-10 w-full bg-[var(--rr-color-bg-tertiary)] rounded-lg" />
    </div>
  );
}
