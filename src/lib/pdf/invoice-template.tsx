import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1E2329',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  invoiceMeta: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 2,
  },
  statusBadge: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginTop: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statusPaid: {
    color: '#10B981',
  },
  statusUnpaid: {
    color: '#F59E0B',
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
    marginVertical: 16,
  },
  // Customer section
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  customerDetail: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 2,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2329',
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  colDescription: { flex: 1 },
  colAmount: { width: 100, textAlign: 'right' },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Summary
  summarySection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
  },
  summaryValue: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
  },
  // Total
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#1E2329',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  totalAmount: {
    width: 100,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 48,
    right: 48,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  footerCta: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    marginTop: 8,
  },
});

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date | null;
  status: 'draft' | 'sent' | 'paid' | 'void';
  customerName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  customerEmail: string;
  selectedTier: string;
  totalPrice: number;
  depositAmount: number;
  invoiceType: 'deposit' | 'balance' | 'full';
  invoiceAmount: number;
  totalPaid: number;
  confirmationNumber: string;
  portalUrl?: string;
}

const COMPANY = {
  name: 'Results Roofing',
  phone: '(512) 555-0199',
  email: 'info@resultsroofing.com',
  license: 'TX License #XXXXXX',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function tierLabel(tier: string): string {
  const labels: Record<string, string> = {
    good: 'Standard Package',
    better: 'Preferred Package',
    best: 'Premium Package',
  };
  return labels[tier] || capitalize(tier) + ' Package';
}

function invoiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    deposit: 'Deposit Invoice',
    balance: 'Balance Invoice',
    full: 'Invoice',
  };
  return labels[type] || 'Invoice';
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const isPaid = data.status === 'paid';

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{COMPANY.name}</Text>
            <Text style={styles.companyDetail}>{COMPANY.phone}</Text>
            <Text style={styles.companyDetail}>{COMPANY.email}</Text>
            <Text style={styles.companyDetail}>{COMPANY.license}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>{invoiceTypeLabel(data.invoiceType)}</Text>
            <Text style={styles.invoiceMeta}>Invoice: {data.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>Date: {formatDate(data.invoiceDate)}</Text>
            {data.dueDate && (
              <Text style={styles.invoiceMeta}>Due: {formatDate(data.dueDate)}</Text>
            )}
            <Text style={styles.invoiceMeta}>Order: {data.confirmationNumber}</Text>
            <Text style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusUnpaid]}>
              {isPaid ? 'PAID' : 'UNPAID'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel}>Bill to</Text>
          <Text style={styles.customerName}>{data.customerName}</Text>
          <Text style={styles.customerDetail}>{data.propertyAddress}</Text>
          <Text style={styles.customerDetail}>
            {data.propertyCity}, {data.propertyState} {data.propertyZip}
          </Text>
          <Text style={styles.customerDetail}>{data.customerEmail}</Text>
        </View>

        {/* Line Items */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.colDescription}>
            Roof Replacement — {tierLabel(data.selectedTier)}
          </Text>
          <Text style={styles.colAmount}>{formatCurrency(data.totalPrice)}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Project total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(data.totalPrice)}</Text>
          </View>
          {data.totalPaid > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payments received</Text>
              <Text style={styles.summaryValue}>-{formatCurrency(data.totalPaid)}</Text>
            </View>
          )}
        </View>

        {/* Amount Due */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {isPaid ? 'Amount paid' : 'Amount due'}
          </Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(data.invoiceAmount)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {COMPANY.name} · {COMPANY.phone} · {COMPANY.email}
          </Text>
          {!isPaid && data.portalUrl ? (
            <Text style={styles.footerCta}>
              Pay online: {data.portalUrl}
            </Text>
          ) : (
            <Text style={styles.footerCta}>Thank you for choosing Results Roofing</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
