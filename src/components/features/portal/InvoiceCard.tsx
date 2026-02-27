'use client';

import { FileText, Download } from 'lucide-react';

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    type: string;
    status: string;
    amount: string;
    dueDate: string | null;
    createdAt: string;
  };
}

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    deposit: 'Deposit',
    balance: 'Balance',
    full: 'Full Amount',
  };
  return labels[type] || type;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const isPaid = invoice.status === 'paid';

  function handleDownload() {
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--rr-color-border-default)] bg-[var(--rr-color-white)] p-4">
      {/* Icon */}
      <div className="flex-shrink-0">
        <FileText size={20} className="text-[var(--rr-color-blue)]" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[var(--rr-color-text-primary)]">
            {invoice.invoiceNumber}
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isPaid
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
        <div className="flex gap-3 text-[13px] text-[var(--rr-color-text-secondary)]">
          <span>{typeLabel(invoice.type)}</span>
          {invoice.dueDate && !isPaid && (
            <span>Due {formatDate(invoice.dueDate)}</span>
          )}
        </div>
      </div>

      {/* Amount + Download */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-base font-semibold tabular-nums text-[var(--rr-color-text-primary)]">
          {formatCurrency(invoice.amount)}
        </span>
        <button
          onClick={handleDownload}
          aria-label={`Download invoice ${invoice.invoiceNumber}`}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--rr-color-border-default)] bg-transparent text-[var(--rr-color-text-tertiary)] transition-colors hover-hover:hover:bg-[var(--rr-color-bg-tertiary)] hover-hover:hover:text-[var(--rr-color-blue)] hover-hover:hover:border-[var(--rr-color-blue)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rr-color-blue)]"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
