import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { BRAND, sharedStyles, PdfFooter, formatCurrency, formatDate, tierLabel } from './shared';

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contractMeta: {
    fontSize: 9,
    color: BRAND.colors.gray,
    marginBottom: 2,
  },
  titleSection: {
    paddingVertical: 20,
  },
  signedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  signedBadgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
  },
  // Sections
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 20,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    color: BRAND.colors.dark,
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
    paddingLeft: 12,
    color: BRAND.colors.dark,
  },
  // Info grid (2-column)
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    width: '45%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
  },
  // Pricing table
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  pricingLabel: {
    fontSize: 10,
  },
  pricingAmount: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  // Terms
  termItem: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
    color: BRAND.colors.lightGray,
  },
  termBold: {
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.dark,
  },
  // Highlight box
  highlightBox: {
    backgroundColor: BRAND.colors.softBg,
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  highlightText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: BRAND.colors.dark,
  },
  // Signature section
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 32,
  },
  signatureItem: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.dark,
    height: 32,
    marginBottom: 4,
    justifyContent: 'flex-end',
  },
  signatureValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Oblique',
    paddingBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: BRAND.colors.gray,
    marginBottom: 2,
  },
  signatureDate: {
    fontSize: 8,
    color: BRAND.colors.gray,
  },
});

export interface ContractData {
  contractNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  selectedTier: string;
  totalPrice: number;
  depositAmount: number;
  balanceDue: number;
  scheduledStartDate: string | null;
  status: string;
  signedAt: Date | null;
  signatureText: string | null;
  signatureIp: string | null;
}

export function ContractPdfDocument({ data }: { data: ContractData }) {
  const isSigned = data.status === 'signed' || data.status === 'completed';
  const fullAddress = `${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}`;
  const packageName = tierLabel(data.selectedTier);

  return (
    <Document>
      {/* Page 1: Parties, Scope, Payment */}
      <Page size="LETTER" style={sharedStyles.page}>
        <View style={sharedStyles.headerBar}>
          <Text style={sharedStyles.headerBarText}>{BRAND.name}</Text>
          <Text style={sharedStyles.headerBarMeta}>Contract</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Roofing Contract</Text>
          <Text style={styles.contractMeta}>Contract #{data.contractNumber}</Text>
          <Text style={styles.contractMeta}>Date: {formatDate(data.date)}</Text>
        </View>

        {isSigned && (
          <View style={styles.signedBadge}>
            <Text style={styles.signedBadgeText}>Signed and Executed</Text>
          </View>
        )}

        {/* Parties */}
        <Text style={styles.sectionTitle}>Parties to Agreement</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contractor</Text>
            <Text style={styles.infoValue}>Results Roofing LLC</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Homeowner</Text>
            <Text style={styles.infoValue}>{data.customerName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Property Address</Text>
            <Text style={styles.infoValue}>{fullAddress}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contact</Text>
            <Text style={styles.infoValue}>{data.customerEmail}</Text>
          </View>
        </View>

        <View style={sharedStyles.divider} />

        {/* Scope of Work */}
        <Text style={styles.sectionTitle}>Scope of Work</Text>
        <Text style={styles.bodyText}>
          The Contractor agrees to perform the following work at {fullAddress}:
        </Text>
        <Text style={styles.listItem}>• Complete tear-off and disposal of existing roofing materials</Text>
        <Text style={styles.listItem}>• Inspection and repair of roof decking as needed</Text>
        <Text style={styles.listItem}>• Installation of synthetic underlayment</Text>
        <Text style={styles.listItem}>• Installation of GAF Timberline HDZ Architectural Shingles</Text>
        <Text style={styles.listItem}>• Installation of new drip edge, flashing, and ventilation</Text>
        <Text style={styles.listItem}>• Complete cleanup and debris removal</Text>
        <Text style={styles.listItem}>• Final inspection and quality assurance walkthrough</Text>

        <View style={sharedStyles.divider} />

        {/* Materials & Package */}
        <Text style={styles.sectionTitle}>Materials &amp; Package</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Selected Package</Text>
            <Text style={styles.infoValue}>{packageName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Scheduled Installation</Text>
            <Text style={styles.infoValue}>{data.scheduledStartDate || 'To be scheduled'}</Text>
          </View>
        </View>

        <View style={sharedStyles.divider} />

        {/* Pricing */}
        <Text style={styles.sectionTitle}>Pricing &amp; Payment Terms</Text>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Project Total ({packageName})</Text>
          <Text style={styles.pricingAmount}>{formatCurrency(data.totalPrice)}</Text>
        </View>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Deposit (Due at Signing)</Text>
          <Text style={styles.pricingAmount}>{formatCurrency(data.depositAmount)}</Text>
        </View>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Balance Due Upon Completion</Text>
          <Text style={styles.pricingAmount}>{formatCurrency(data.balanceDue)}</Text>
        </View>

        <PdfFooter message={`${BRAND.name} · Licensed · Bonded · Insured`} />
      </Page>

      {/* Page 2: Terms & Conditions, Signatures */}
      <Page size="LETTER" style={sharedStyles.page}>
        <View style={sharedStyles.headerBar}>
          <Text style={sharedStyles.headerBarText}>{BRAND.name}</Text>
          <Text style={sharedStyles.headerBarMeta}>Contract — Page 2</Text>
        </View>

        <View style={{ paddingTop: 20 }}>
          <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>

          <Text style={styles.termItem}>
            <Text style={styles.termBold}>1. Warranty: </Text>
            This project includes a 30-year manufacturer warranty on materials and a 10-year workmanship warranty from Results Roofing.
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>2. Permits: </Text>
            Contractor will obtain all necessary building permits.
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>3. Insurance: </Text>
            Contractor maintains full liability and workers&apos; compensation insurance.
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>4. Changes: </Text>
            Any changes to the scope of work must be agreed upon in writing.
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>5. Cancellation: </Text>
            Homeowner may cancel within 3 business days for a full deposit refund.
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>6. Weather: </Text>
            Installation may be rescheduled due to inclement weather at no additional cost.
          </Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            3-Day Right to Cancel: You have the right to cancel this contract within three (3) business days of signing. To cancel, contact us in writing at {BRAND.email}.
          </Text>
        </View>

        {/* Signature block */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine}>
              {isSigned && data.signatureText && (
                <Text style={styles.signatureValue}>{data.signatureText}</Text>
              )}
            </View>
            <Text style={styles.signatureLabel}>Homeowner Signature</Text>
            {isSigned && data.signedAt && (
              <Text style={styles.signatureDate}>Signed: {formatDate(data.signedAt)}</Text>
            )}
            {isSigned && data.signatureIp && (
              <Text style={styles.signatureDate}>IP: {data.signatureIp}</Text>
            )}
          </View>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Contractor Representative</Text>
          </View>
        </View>

        <PdfFooter message="This contract is binding upon acceptance by both parties." />
      </Page>
    </Document>
  );
}
