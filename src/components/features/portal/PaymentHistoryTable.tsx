'use client';

import { CreditCard, Download } from 'lucide-react';

interface Payment {
  id: string;
  type: string;
  amount: number;
  status: string;
  processedAt: string | Date | null;
}

interface PaymentHistoryTableProps {
  payments: Payment[];
  onDownloadReceipt: (paymentId: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    deposit: 'bg-blue-50 text-blue-700 border-blue-200',
    balance: 'bg-green-50 text-green-700 border-green-200',
    refund: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const cls = colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    succeeded: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  const cls = colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

export function PaymentHistoryTable({ payments, onDownloadReceipt }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--rr-color-text-primary)] mb-6">
          Payment history
        </h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CreditCard size={48} className="text-[var(--rr-color-text-tertiary)] mb-3" />
          <p className="text-sm font-medium text-[var(--rr-color-text-secondary)]">No payments yet</p>
          <p className="text-xs text-[var(--rr-color-text-tertiary)] mt-1">
            Complete your first payment above to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--rr-color-text-primary)] mb-4">
        Payment history
      </h2>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--rr-color-border-default)]">
              <th className="pb-3 text-left text-xs uppercase tracking-wider font-medium text-[var(--rr-color-text-tertiary)]">
                Date
              </th>
              <th className="pb-3 text-left text-xs uppercase tracking-wider font-medium text-[var(--rr-color-text-tertiary)]">
                Type
              </th>
              <th className="pb-3 text-right text-xs uppercase tracking-wider font-medium text-[var(--rr-color-text-tertiary)]">
                Amount
              </th>
              <th className="pb-3 text-left text-xs uppercase tracking-wider font-medium text-[var(--rr-color-text-tertiary)]">
                Status
              </th>
              <th className="pb-3 text-right text-xs uppercase tracking-wider font-medium text-[var(--rr-color-text-tertiary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-[var(--rr-color-border-default)] last:border-b-0 group hover-hover:hover:bg-[var(--rr-color-surface-hover)] transition-colors"
              >
                <td className="py-3 text-[var(--rr-color-text-primary)]">
                  {formatDate(payment.processedAt)}
                </td>
                <td className="py-3">
                  <TypeBadge type={payment.type} />
                </td>
                <td className="py-3 text-right tabular-nums font-medium text-[var(--rr-color-text-primary)]">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="py-3">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="py-3 text-right">
                  {payment.status === 'succeeded' && (
                    <button
                      onClick={() => onDownloadReceipt(payment.id)}
                      className="inline-flex items-center justify-center w-11 h-11 rounded-md text-[var(--rr-color-text-secondary)] hover-hover:hover:bg-[var(--rr-color-bg-tertiary)] hover-hover:hover:text-[var(--rr-color-blue)] active:scale-[0.97] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-blue)]"
                      aria-label="Download receipt"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PaymentHistoryTableSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-6 shadow-sm animate-pulse">
      <div className="h-5 w-32 bg-[var(--rr-color-bg-tertiary)] rounded mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="h-4 w-20 bg-[var(--rr-color-bg-tertiary)] rounded" />
          <div className="h-5 w-14 bg-[var(--rr-color-bg-tertiary)] rounded-full" />
          <div className="h-4 w-16 bg-[var(--rr-color-bg-tertiary)] rounded ml-auto" />
          <div className="h-5 w-16 bg-[var(--rr-color-bg-tertiary)] rounded-full" />
          <div className="h-8 w-8 bg-[var(--rr-color-bg-tertiary)] rounded" />
        </div>
      ))}
    </div>
  );
}
