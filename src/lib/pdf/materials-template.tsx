import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { BRAND, sharedStyles, PdfFooter } from './shared';

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: BRAND.colors.gray,
  },
  titleSection: {
    paddingVertical: 20,
  },
  // 5-column table
  colMaterial: { width: 120 },
  colBrand: { flex: 1 },
  colColor: { width: 80 },
  colQty: { width: 50, textAlign: 'right' },
  colUnit: { width: 70, textAlign: 'right' },
  materialBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
});

export interface MaterialItem {
  material: string;
  brand: string;
  color: string;
  qty: number;
  unit: string;
}

export interface MaterialsData {
  confirmationNumber: string;
  date: Date;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  items: MaterialItem[];
}

export function MaterialsPdfDocument({ data }: { data: MaterialsData }) {
  return (
    <Document>
      <Page size="LETTER" style={sharedStyles.page}>
        {/* Header bar */}
        <View style={sharedStyles.headerBar}>
          <Text style={sharedStyles.headerBarText}>{BRAND.name}</Text>
          <Text style={sharedStyles.headerBarMeta}>Material Order</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Material Order</Text>
          <Text style={styles.subtitle}>
            Detailed material list with brands and specifications
          </Text>
        </View>

        {/* Table header */}
        <View style={sharedStyles.tableHeader}>
          <Text style={[sharedStyles.tableHeaderText, styles.colMaterial]}>Material</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colBrand]}>Brand</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colColor]}>Color</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[sharedStyles.tableHeaderText, styles.colUnit]}>Unit</Text>
        </View>

        {/* Data rows */}
        {data.items.map((item, i) => (
          <View key={i} style={i % 2 === 1 ? sharedStyles.tableRowAlt : sharedStyles.tableRow}>
            <Text style={[styles.colMaterial, styles.materialBold]}>{item.material}</Text>
            <Text style={styles.colBrand}>{item.brand}</Text>
            <Text style={styles.colColor}>{item.color || '\u2014'}</Text>
            <Text style={styles.colQty}>{item.qty}</Text>
            <Text style={styles.colUnit}>{item.unit}</Text>
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
