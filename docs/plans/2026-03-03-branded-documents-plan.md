# Branded Documents Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every document in the homeowner portal viewable as a large scrollable preview AND downloadable as a branded Results Roofing PDF.

**Architecture:** Two rendering paths per document — web templates (React DOM + CSS Modules) for in-modal preview, `@react-pdf/renderer` templates for PDF download. Single API endpoint routes to correct template. Portal documents page integrates the existing DocumentViewer modal.

**Tech Stack:** Next.js 14, `@react-pdf/renderer`, React Query, Clerk auth, Drizzle ORM

**Design Doc:** `docs/plans/2026-03-03-branded-documents-design.md`

---

## Task 1: Shared PDF Infrastructure

**Files:**
- Create: `src/lib/pdf/shared.tsx`

**Step 1: Create shared PDF components and utilities**

Extract common elements from `receipt-template.tsx` and `invoice-template.tsx` into a shared module. This provides consistent branding across all PDF templates.

```tsx
// src/lib/pdf/shared.tsx
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

// Shared styles used across all templates
export const sharedStyles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BRAND.colors.dark,
  },
  // Dark header bar (matching wireframe)
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
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20` from project root
Expected: No errors related to `shared.tsx`

**Step 3: Commit**

```bash
git add src/lib/pdf/shared.tsx
git commit -m "feat: add shared PDF infrastructure for branded documents"
```

---

## Task 2: Quote Summary PDF Template

**Files:**
- Create: `src/lib/pdf/quote-template.tsx`

**Step 1: Create the quote summary template**

Matches wireframe `twMUo` — 4-column line item table with materials + labor sections.

```tsx
// src/lib/pdf/quote-template.tsx
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
```

**Step 2: Type check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/lib/pdf/quote-template.tsx
git commit -m "feat: add quote summary PDF template with line items"
```

---

## Task 3: Materials Order PDF Template

**Files:**
- Create: `src/lib/pdf/materials-template.tsx`

**Step 1: Create the materials template**

Matches wireframe `fYmCN` — 5-column table with brand and color columns.

```tsx
// src/lib/pdf/materials-template.tsx
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

export function MaterialsDocument({ data }: { data: MaterialsData }) {
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
```

**Step 2: Type check, then commit**

```bash
git add src/lib/pdf/materials-template.tsx
git commit -m "feat: add materials order PDF template with 5-column table"
```

---

## Task 4: Contract PDF Template (2-page)

**Files:**
- Create: `src/lib/pdf/contract-template.tsx`

**Step 1: Create the contract template**

Matches wireframes `qbxvV` + `Klcau`. Two-page PDF with parties, scope, terms, and signature section.

The contract template is the longest — it includes:
- Page 1: Header, parties, scope of work, payment terms
- Page 2: Terms & conditions, signature block (renders signed data if available)

Reference the existing web template at `src/components/features/documents/templates/ContractDocument.tsx` for content structure. The PDF version uses the same sections but with `@react-pdf/renderer` components.

Key data interface:
```tsx
export interface ContractData {
  contractNumber: string;
  date: Date;
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  // Package
  selectedTier: string;
  totalPrice: number;
  depositAmount: number;
  balanceDue: number;
  // Signature
  status: string;
  signedAt: Date | null;
  signatureText: string | null;
  signatureIp: string | null;
}
```

**Step 2: Type check, then commit**

```bash
git add src/lib/pdf/contract-template.tsx
git commit -m "feat: add 2-page contract PDF template with signature section"
```

---

## Task 5: Deposit Authorization PDF Template

**Files:**
- Create: `src/lib/pdf/deposit-auth-template.tsx`

**Step 1: Create the deposit auth template**

Based on the receipt template pattern. Shows deposit amount, payment method, authorization terms.

Key data interface:
```tsx
export interface DepositAuthData {
  confirmationNumber: string;
  date: Date;
  customerName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  customerEmail: string;
  depositAmount: number;
  totalPrice: number;
  cardBrand: string | null;
  cardLast4: string | null;
  selectedTier: string;
}
```

**Step 2: Type check, then commit**

```bash
git add src/lib/pdf/deposit-auth-template.tsx
git commit -m "feat: add deposit authorization PDF template"
```

---

## Task 6: Refactor Existing PDF Templates to Use Shared Module

**Files:**
- Modify: `src/lib/pdf/receipt-template.tsx`
- Modify: `src/lib/pdf/invoice-template.tsx`

**Step 1: Update receipt template**

Replace local `COMPANY`, `formatCurrency`, `formatDate`, `capitalize`, `tierLabel` with imports from `./shared`. Keep the template's own styles and `ReceiptData` interface. Remove duplicate utility functions.

**Step 2: Update invoice template**

Same approach — import shared utilities, remove duplicates.

**Step 3: Type check both files**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 4: Commit**

```bash
git add src/lib/pdf/receipt-template.tsx src/lib/pdf/invoice-template.tsx
git commit -m "refactor: use shared PDF utilities in receipt and invoice templates"
```

---

## Task 7: PDF Generation API Endpoint

**Files:**
- Create: `src/app/api/portal/documents/[id]/pdf/route.ts`

**Step 1: Create the API route**

This endpoint generates any branded PDF by document ID. It follows the exact pattern from `src/app/api/portal/receipts/[paymentId]/route.ts`.

```tsx
// src/app/api/portal/documents/[id]/pdf/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { db, schema, eq, and } from '@/db';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
// Import all PDF templates
import { QuoteDocument, type QuoteData } from '@/lib/pdf/quote-template';
import { MaterialsDocument as MaterialsPdf, type MaterialsData } from '@/lib/pdf/materials-template';
import { ContractDocument as ContractPdf, type ContractData } from '@/lib/pdf/contract-template';
import { DepositAuthDocument, type DepositAuthData } from '@/lib/pdf/deposit-auth-template';
import { ReceiptDocument, type ReceiptData } from '@/lib/pdf/receipt-template';
import { InvoiceDocument, type InvoiceData } from '@/lib/pdf/invoice-template';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Auth (same pattern as receipts route)
  // 2. Fetch document by ID
  // 3. Fetch related order (verify ownership)
  // 4. Based on document.type, fetch additional data and build template data
  // 5. renderToBuffer → return PDF response
  //
  // Switch on document.type:
  //   'contract' → fetch contract + order → ContractPdf
  //   'deposit_authorization' → fetch deposit payment + order → DepositAuthDocument
  //   'receipt' → fetch payment + order → ReceiptDocument
  //   'invoice' → fetch order + payments → InvoiceDocument
  //   For quote/materials: fetch order + measurement → QuoteDocument / MaterialsPdf
}
```

The route should handle these document types:
- `contract` → `ContractPdf` with contract + order data
- `deposit_authorization` → `DepositAuthDocument` with deposit payment + order
- `receipt` → `ReceiptDocument` (existing template, same data as receipts route)
- `invoice` → `InvoiceDocument` (existing template)

For quote summary and material order, these may need to be generated on-the-fly from order + measurement data (not stored as document records). Consider supporting a `type` query param: `/api/portal/documents/[orderId]/pdf?type=quote`

**Step 2: Type check**

**Step 3: Commit**

```bash
git add src/app/api/portal/documents/\[id\]/pdf/route.ts
git commit -m "feat: add PDF generation API endpoint for all document types"
```

---

## Task 8: Wire DocumentViewer Modal into Portal Documents Page

**Files:**
- Modify: `src/app/portal/documents/page.tsx`
- Modify: `src/components/features/documents/DocumentViewer.tsx`

**Step 1: Update DocumentViewer download handler**

Replace the `alert()` stub in `handleDownload` with actual PDF fetch + blob download:

```tsx
const handleDownload = async () => {
  if (!currentDocument) return;
  try {
    const res = await fetch(`/api/portal/documents/${currentDocument.id}/pdf`);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDocument.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF download error:', err);
  }
};
```

**Step 2: Update portal documents page**

Import `DocumentProvider`, `DocumentViewer`, and `useDocument` from `@/components/features/documents`. Wrap `DocumentsList` in `DocumentProvider`. Add `DocumentViewer` to the render tree. On row click, open the viewer with mapped document data.

The `DocumentRow` click handler needs to:
1. Map `PortalDocument` to `DocumentData` (the web preview interface)
2. Call `openDocument(mappedData)` from the document context

**Step 3: Test the flow manually**

- Click a document row → modal opens with web preview
- Click Download → PDF downloads
- Click Close / Escape → modal closes

**Step 4: Commit**

```bash
git add src/app/portal/documents/page.tsx src/components/features/documents/DocumentViewer.tsx
git commit -m "feat: wire document preview modal + PDF download into portal"
```

---

## Task 9: Update Documents API to Include All Doc Types

**Files:**
- Modify: `src/app/api/portal/documents/route.ts`

**Step 1: Add generated documents to the API response**

Currently the API only returns GAF assets + manual documents from the DB. Add synthetic document entries for:
- Quote Summary (always available if order exists)
- Material Order (available if measurement complete)
- Contract (from contracts table)
- Deposit Auth (available if deposit payment exists)

These are generated on-the-fly from order data, not stored as `documents` table records.

**Step 2: Commit**

```bash
git add src/app/api/portal/documents/route.ts
git commit -m "feat: include all branded doc types in portal documents API"
```

---

## Task 10: Type Check + Manual Testing

**Step 1: Full type check**

Run: `npx tsc --noEmit --pretty`
Fix any errors.

**Step 2: Run dev server and test**

Run: `npm run dev`
Navigate to `/portal/documents` and verify:
- Document list shows all document types
- Clicking a row opens the preview modal
- Download button generates and downloads PDF
- Modal UX works (escape, backdrop click, scroll)

**Step 3: Final commit**

```bash
git commit -m "chore: type fixes and final cleanup for branded documents"
```

---

## Execution Notes

### Dependencies between tasks:
- Task 1 (shared) must be done first — all other templates import from it
- Tasks 2-5 (templates) can be done in parallel — they're independent
- Task 6 (refactor existing) can happen anytime after Task 1
- Task 7 (API) needs Tasks 1-5 complete (imports all templates)
- Task 8 (portal wiring) needs Task 7 (calls the API)
- Task 9 (documents API update) is independent of Tasks 2-8
- Task 10 is last

### Key patterns to follow:
- **Auth pattern:** Copy from `src/app/api/portal/receipts/[paymentId]/route.ts`
- **PDF render pattern:** `renderToBuffer(React.createElement(Template, { data }) as any)`
- **Response pattern:** `new Response(new Uint8Array(buffer), { headers: {...} })`
- **DB queries:** Use `db.query.TABLE.findFirst({ where: eq(...), with: {...} })`
- **Dev bypass:** Always check `DEV_BYPASS_ENABLED` first, use `MOCK_USER.id`

### Reference files:
- Existing receipt PDF: `src/lib/pdf/receipt-template.tsx`
- Receipt API route: `src/app/api/portal/receipts/[paymentId]/route.ts`
- Portal documents page: `src/app/portal/documents/page.tsx`
- DocumentViewer: `src/components/features/documents/DocumentViewer.tsx`
- Web preview templates: `src/components/features/documents/templates/`
- DB schemas: `src/db/schema/orders.ts`, `contracts.ts`, `payments.ts`, `measurements.ts`, `documents.ts`
- Wireframes: `designs/branded-documents.pen` (use Pencil MCP to read)
