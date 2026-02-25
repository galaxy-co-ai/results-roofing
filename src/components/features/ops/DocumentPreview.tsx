'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LineItem {
  label: string;
  amount: number;
}

interface DocumentPreviewProps {
  type: 'invoice' | 'estimate';
  data: {
    // Common
    id: string;
    customerName?: string | null;
    propertyAddress: string;
    status: string;
    createdAt: string;
    totalPrice: number;
    // Invoice-specific
    confirmationNumber?: string;
    customerEmail?: string;
    selectedTier?: string;
    depositAmount?: number;
    balanceDue?: number;
    paidAmount?: number;
    financingUsed?: string | null;
    scheduledStartDate?: string | null;
    // Estimate-specific
    customer?: string;
    city?: string;
    state?: string;
    zip?: string;
    sqftTotal?: number | null;
    selectedTier2?: string | null;
    expiresAt?: string | null;
  };
}

function formatCurrency(val: number | null | undefined): string {
  if (val == null) return '$0';
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function DocumentPreview({ type, data }: DocumentPreviewProps) {
  const isInvoice = type === 'invoice';
  const docNumber = isInvoice
    ? data.confirmationNumber || data.id.slice(0, 8).toUpperCase()
    : data.id.slice(0, 8).toUpperCase();
  const customerDisplay = data.customerName || data.customer || 'Customer';
  const address = data.propertyAddress;
  const fullAddress = data.city
    ? `${address}, ${data.city}, ${data.state || ''} ${data.zip || ''}`
    : address;

  // Build line items from available data
  const lineItems: LineItem[] = [];
  const tier = data.selectedTier || data.selectedTier2;
  if (tier) {
    lineItems.push({
      label: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Package — Roof Replacement`,
      amount: data.totalPrice,
    });
  } else {
    lineItems.push({ label: 'Roof Replacement', amount: data.totalPrice });
  }

  return (
    <div className="bg-white">
      {/* Print Button */}
      <div className="flex justify-end p-4 pb-0 print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / PDF
        </Button>
      </div>

      {/* Document Body */}
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Results Roofing</h2>
            <p className="text-sm text-muted-foreground mt-1">Professional Roofing Services</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {isInvoice ? 'Invoice' : 'Estimate'}
            </p>
            <p className="text-lg font-bold mt-0.5">#{docNumber}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(data.createdAt)}</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Customer + Status */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Bill To</p>
            <p className="font-semibold">{customerDisplay}</p>
            {data.customerEmail && (
              <p className="text-sm text-muted-foreground">{data.customerEmail}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{fullAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Status</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-muted">
              {statusLabel(data.status)}
            </span>
            {data.sqftTotal && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Roof Area</p>
                <p className="font-semibold tabular-nums">{data.sqftTotal.toLocaleString()} sq ft</p>
              </div>
            )}
            {data.expiresAt && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Valid Until</p>
                <p className="text-sm">{formatDate(data.expiresAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground py-2">Description</th>
                <th className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3 text-sm">{item.label}</td>
                  <td className="py-3 text-sm text-right font-medium tabular-nums">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(data.totalPrice)}</span>
            </div>
            {isInvoice && data.depositAmount != null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit</span>
                <span className="tabular-nums text-green-600">-{formatCurrency(data.depositAmount)}</span>
              </div>
            )}
            {isInvoice && data.paidAmount != null && data.paidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="tabular-nums text-green-600">{formatCurrency(data.paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2 font-semibold">
              <span>{isInvoice ? 'Balance Due' : 'Total'}</span>
              <span className="tabular-nums">
                {isInvoice ? formatCurrency(data.balanceDue ?? data.totalPrice) : formatCurrency(data.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 space-y-3">
          {isInvoice && data.financingUsed && (
            <p className="text-xs text-muted-foreground">Financing: {data.financingUsed}</p>
          )}
          {isInvoice && data.scheduledStartDate && (
            <p className="text-xs text-muted-foreground">Scheduled Start: {formatDate(data.scheduledStartDate)}</p>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Thank you for choosing Results Roofing.</p>
            <p>Questions? Contact us at support@resultsroofing.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
