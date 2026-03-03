import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// Brand constants
export const BRAND = {
  name: 'Results Roofing',
  phone: process.env.COMPANY_PHONE || '(214) 272-2424',
  email: process.env.COMPANY_EMAIL || 'info@resultsroofing.com',
  license: process.env.COMPANY_LICENSE || 'TX License #XXXXXX',
  url: 'resultsroofing.com',
  colors: {
    dark: '#1E2329',
    blue: '#2563EB',
    gray: '#6B7280',
    lightGray: '#4B5563',
    border: '#E8EDF5',
    softBg: '#F7F9FC',
    white: '#FFFFFF',
  },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function tierLabel(tier: string): string {
  const labels: Record<string, string> = {
    good: 'Standard Package',
    better: 'Preferred Package',
    best: 'Premium Package',
  };
  return labels[tier] || capitalize(tier) + ' Package';
}

export function cardDisplay(brand: string | null, last4: string | null): string {
  if (!brand && !last4) return 'Card';
  const brandName = brand ? capitalize(brand) : 'Card';
  return last4 ? `${brandName} ending in ${last4}` : brandName;
}

// Shared styles used across all templates
export const sharedStyles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BRAND.colors.dark,
  },
  // Dark header bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BRAND.colors.dark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  headerBarText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.white,
  },
  headerBarMeta: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  // Two-column header (company left, doc info right)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.blue,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: BRAND.colors.gray,
    marginBottom: 2,
  },
  // Section labels
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
    marginVertical: 16,
  },
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.dark,
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    backgroundColor: BRAND.colors.softBg,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    color: BRAND.colors.gray,
    marginBottom: 2,
  },
  footerBrand: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.colors.blue,
    marginTop: 8,
  },
});

/** Branded page footer — used on every PDF page */
export function PdfFooter({ message }: { message?: string }) {
  return (
    <View style={sharedStyles.footer}>
      <Text style={sharedStyles.footerText}>
        {BRAND.name} · {BRAND.phone} · {BRAND.email}
      </Text>
      <Text style={sharedStyles.footerBrand}>
        {message || 'Thank you for choosing Results Roofing'}
      </Text>
    </View>
  );
}
