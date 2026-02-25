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
  receiptTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  receiptMeta: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 2,
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
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  totalAmount: {
    width: 100,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  // Payment method
  paymentMethodSection: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#F7F9FC',
    borderRadius: 4,
  },
  paymentMethodLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paymentMethodValue: {
    fontSize: 10,
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
  footerThank: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    marginTop: 8,
  },
});

export interface ReceiptData {
  // Payment
  paymentId: string;
  amount: number;
  paymentType: string;
  cardBrand: string | null;
  cardLast4: string | null;
  processedAt: Date;
  stripePaymentIntentId: string | null;
  // Order
  confirmationNumber: string;
  selectedTier: string;
  totalPrice: number;
  // Customer
  customerName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  customerEmail: string;
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

function cardDisplay(brand: string | null, last4: string | null): string {
  if (!brand && !last4) return 'Card';
  const brandName = brand ? capitalize(brand) : 'Card';
  return last4 ? `${brandName} ending in ${last4}` : brandName;
}

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  const typeLabel = data.paymentType === 'balance' ? 'Balance payment' : 'Deposit';
  const description = `${typeLabel} — ${tierLabel(data.selectedTier)}`;

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
            <Text style={styles.receiptTitle}>Payment Receipt</Text>
            <Text style={styles.receiptMeta}>Date: {formatDate(data.processedAt)}</Text>
            <Text style={styles.receiptMeta}>Confirmation: {data.confirmationNumber}</Text>
            {data.stripePaymentIntentId && (
              <Text style={styles.receiptMeta}>Ref: {data.stripePaymentIntentId}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer info */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel}>Billed to</Text>
          <Text style={styles.customerName}>{data.customerName}</Text>
          <Text style={styles.customerDetail}>{data.propertyAddress}</Text>
          <Text style={styles.customerDetail}>
            {data.propertyCity}, {data.propertyState} {data.propertyZip}
          </Text>
          <Text style={styles.customerDetail}>{data.customerEmail}</Text>
        </View>

        {/* Line items */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.colDescription}>{description}</Text>
          <Text style={styles.colAmount}>{formatCurrency(data.amount)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total paid</Text>
          <Text style={styles.totalAmount}>{formatCurrency(data.amount)}</Text>
        </View>

        {/* Payment method */}
        <View style={styles.paymentMethodSection}>
          <Text style={styles.paymentMethodLabel}>Payment method</Text>
          <Text style={styles.paymentMethodValue}>
            {cardDisplay(data.cardBrand, data.cardLast4)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {COMPANY.name} · {COMPANY.phone} · {COMPANY.email}
          </Text>
          <Text style={styles.footerThank}>Thank you for choosing Results Roofing</Text>
        </View>
      </Page>
    </Document>
  );
}
