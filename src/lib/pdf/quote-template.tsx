import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { BRAND, sharedStyles, PdfFooter, formatCurrency, formatDate, tierLabel } from './shared';

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: BRAND.colors.gray,
    marginBottom: 4,
  },
  titleSection: {
    paddingVertical: 20,
  },
  // 4-column table
  colItem: { flex: 1 },
  colQty: { width: 60, textAlign: 'right' },
  colUnit: { width: 80, textAlign: 'right' },
  colAmount: { width: 100, textAlign: 'right' },
  // Category header
  categoryRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Totals
  subtotalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  subtotalLabel: {
    flex: 1,
    fontSize: 10,
    color: BRAND.colors.gray,
  },
  subtotalValue: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
  },
  totalDivider: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND.colors.dark,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
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
    color: BRAND.colors.blue,
  },
});

export interface QuoteLineItem {
  name: string;
  qty: number;
  unit: string;
  amount: number;
}

export interface QuoteData {
  confirmationNumber: string;
  date: Date;
  customerName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  selectedTier: string;
  materials: QuoteLineItem[];
  labor: QuoteLineItem[];
  materialTotal: number;
  laborTotal: number;
  grandTotal: number;
}

function LineItemRow({ item, alt }: { item: QuoteLineItem; alt: boolean }) {
  return (
    <View style={alt ? sharedStyles.tableRowAlt : sharedStyles.tableRow}>
      <Text style={styles.colItem}>{item.name}</Text>
      <Text style={styles.colQty}>{item.qty}</Text>
      <Text style={styles.colUnit}>{item.unit}</Text>
      <Text style={styles.colAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );
}

export function QuoteDocument({ data }: { data: QuoteData }) {
  return (
    <Document>
      <Page size="LETTER" style={sharedStyles.page}>
        {/* Header bar */}
        <View style={sharedStyles.headerBar}>
          <Text style={sharedStyles.headerBarText}>{BRAND.name}</Text>
          <Text style={sharedStyles.headerBarMeta}>Estimate</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Roof Replacement Estimate</Text>
          <Text style={styles.subtitle}>
            {data.propertyAddress}, {data.propertyCity}, {data.propertyState} {data.propertyZip}
          </Text>
          <Text style={styles.subtitle}>
            {tierLabel(data.selectedTier)} · {formatDate(data.date)}
          </Text>
        </View>

        <View style={sharedStyles.divider} />

        {/* Table header */}
        <View style={sharedStyles.tableHeader}>
          <Text style={[sharedStyles.tableHeaderText, styles.colItem]}>Item</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colUnit]}>Unit</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>

        {/* Materials category */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>Materials</Text>
        </View>
        {data.materials.map((item, i) => (
          <LineItemRow key={`mat-${i}`} item={item} alt={i % 2 === 1} />
        ))}

        {/* Labor category */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>Labor</Text>
        </View>
        {data.labor.map((item, i) => (
          <LineItemRow key={`lab-${i}`} item={item} alt={i % 2 === 1} />
        ))}

        {/* Subtotals */}
        <View style={{ marginTop: 12 }}>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Materials subtotal</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(data.materialTotal)}</Text>
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Labor subtotal</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(data.laborTotal)}</Text>
          </View>
        </View>

        {/* Grand total */}
        <View style={styles.totalDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(data.grandTotal)}</Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
