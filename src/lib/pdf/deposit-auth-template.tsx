import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  BRAND,
  sharedStyles,
  PdfFooter,
  formatCurrency,
  formatDate,
  tierLabel,
  cardDisplay,
} from './shared';

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  meta: {
    fontSize: 9,
    color: BRAND.colors.gray,
    marginBottom: 2,
  },
  titleSection: {
    paddingVertical: 20,
  },
  // Customer section
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  customerDetail: {
    fontSize: 10,
    color: BRAND.colors.lightGray,
    marginBottom: 2,
  },
  // Amount box
  amountBox: {
    backgroundColor: BRAND.colors.softBg,
    padding: 20,
    borderRadius: 4,
    marginVertical: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.blue,
    marginBottom: 4,
  },
  amountContext: {
    fontSize: 9,
    color: BRAND.colors.gray,
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  infoLabel: {
    fontSize: 10,
    color: BRAND.colors.gray,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  // Terms
  termsSection: {
    marginTop: 24,
  },
  termsTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  termItem: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
    color: BRAND.colors.lightGray,
  },
});

export interface DepositAuthData {
  confirmationNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  depositAmount: number;
  totalPrice: number;
  cardBrand: string | null;
  cardLast4: string | null;
  selectedTier: string;
}

export function DepositAuthDocument({ data }: { data: DepositAuthData }) {
  const balanceDue = data.totalPrice - data.depositAmount;

  return (
    <Document>
      <Page size="LETTER" style={sharedStyles.page}>
        {/* Header bar */}
        <View style={sharedStyles.headerBar}>
          <Text style={sharedStyles.headerBarText}>{BRAND.name}</Text>
          <Text style={sharedStyles.headerBarMeta}>Deposit Authorization</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Deposit Authorization</Text>
          <Text style={styles.meta}>Confirmation: {data.confirmationNumber}</Text>
          <Text style={styles.meta}>Date: {formatDate(data.date)}</Text>
        </View>

        <View style={sharedStyles.divider} />

        {/* Customer info */}
        <View style={{ marginBottom: 16 }}>
          <Text style={sharedStyles.sectionLabel}>Authorized By</Text>
          <Text style={styles.customerName}>{data.customerName}</Text>
          <Text style={styles.customerDetail}>{data.propertyAddress}</Text>
          <Text style={styles.customerDetail}>
            {data.propertyCity}, {data.propertyState} {data.propertyZip}
          </Text>
          <Text style={styles.customerDetail}>{data.customerEmail}</Text>
        </View>

        {/* Deposit amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Deposit Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.depositAmount)}</Text>
          <Text style={styles.amountContext}>
            Applied to {tierLabel(data.selectedTier)} · Total: {formatCurrency(data.totalPrice)}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method</Text>
          <Text style={styles.infoValue}>{cardDisplay(data.cardBrand, data.cardLast4)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Project Total</Text>
          <Text style={styles.infoValue}>{formatCurrency(data.totalPrice)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Deposit Applied</Text>
          <Text style={styles.infoValue}>{formatCurrency(data.depositAmount)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Remaining Balance</Text>
          <Text style={styles.infoValue}>{formatCurrency(balanceDue)}</Text>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Deposit Terms</Text>
          <Text style={styles.termItem}>
            • This deposit secures your project date and initiates the material ordering process.
          </Text>
          <Text style={styles.termItem}>
            • The deposit is fully refundable within 3 business days of authorization.
          </Text>
          <Text style={styles.termItem}>
            • The remaining balance of {formatCurrency(balanceDue)} is due upon project completion.
          </Text>
          <Text style={styles.termItem}>
            • By authorizing this deposit, you confirm your agreement to the project scope and pricing as outlined in your contract.
          </Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
