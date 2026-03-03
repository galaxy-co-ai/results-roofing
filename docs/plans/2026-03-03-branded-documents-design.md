# Branded Documents — Design

**Date:** 2026-03-03
**SOW Item:** Task 12 (Batch 5) — Branded measurement report + full document suite
**Status:** Design approved

## Goal

Every document in the homeowner portal is viewable as a large scrollable preview AND downloadable as a branded Results Roofing PDF. No GAF branding, no stubs, no alerts.

## Two Rendering Paths

| Action | Renderer | Location |
|--------|----------|----------|
| **Preview** (click thumbnail) | Web templates (React DOM + CSS Modules) | `components/features/documents/templates/` |
| **Download** (button) | `@react-pdf/renderer` templates | `lib/pdf/` |

Both paths use the same data. Web templates already exist for 6 doc types. PDF templates exist for receipt + invoice. Need 4 new PDF templates.

## Document Types

| # | Document | Web Preview | PDF Template | Status |
|---|----------|-------------|-------------|--------|
| 1 | Quote Summary (estimate) | `ContractDocument.tsx` → repurpose or new | `quote-template.tsx` | **New** |
| 2 | Material Order | `MaterialsDocument.tsx` | `materials-template.tsx` | **New** |
| 3 | Contract (2-page) | `ContractDocument.tsx` | `contract-template.tsx` | **New** |
| 4 | Deposit Authorization | New web template | `deposit-auth-template.tsx` | **New** |
| 5 | Receipt | `ReceiptDocument.tsx` | `receipt-template.tsx` | **Exists** (update branding) |
| 6 | Invoice | — | `invoice-template.tsx` | **Exists** (update branding) |

## Shared PDF Infrastructure

### `src/lib/pdf/shared.tsx`
- `PdfHeader` — dark bar, "Results Roofing" left, page number right
- `PdfFooter` — company URL left, tagline right
- `BRAND` constants — colors (`#1E2329` dark, `#2563EB` blue, `#F8F9FA` soft), company info
- `formatCurrency()`, `formatDate()` — extracted from receipt template

### API Endpoint: `GET /api/portal/documents/[id]/pdf`
- Clerk auth + order ownership check
- Lookup document by ID → route to correct PDF template
- Fetch related data (order, payments, measurements, contracts)
- `renderToBuffer()` → return `Content-Type: application/pdf`

## Portal UX Flow

```
Documents Page (list)
  └─ DocumentRow (thumbnail + name + badges)
       ├─ Click row/thumbnail → DocumentViewer modal (large, scrollable web preview)
       │    └─ Action bar: Download | Share | Print | Close
       │         └─ Download → fetch /api/portal/documents/{id}/pdf → blob download
       └─ Quick Download button → same PDF API
```

### Changes to Portal Documents Page
1. Import `DocumentProvider` + `DocumentViewer` from `components/features/documents/`
2. On row click → open `DocumentViewer` modal with document data
3. Map API document types to web preview template types
4. Pass real order/payment data to templates instead of mock data

### Changes to DocumentViewer
1. Replace `handleDownload()` alert with real PDF fetch + blob download
2. Accept real `DocumentData` with populated `projectData` from portal

## PDF Template Specs (from wireframes)

### Quote Summary (`quote-template.tsx`)
- Wireframe: `twMUo` in branded-documents.pen
- Header bar (dark) + "Roof Replacement Estimate" title
- 4-column line item table: ITEM | QTY | UNIT | AMOUNT
- Materials section (shingles, underlayment, starter, leak barrier, ridge cap, drip edge, nails, ventilation)
- Labor section (tear-off, installation, cleanup)
- Subtotals (materials, labor) + grand total in brand blue
- CTA + footer

### Material Order (`materials-template.tsx`)
- Wireframe: `fYmCN` in branded-documents.pen
- Header bar + "Material Order" title
- 5-column table: MATERIAL | BRAND | COLOR | QTY | UNIT
- 8 rows with GAF product data from measurements or tier defaults
- CTA + footer

### Contract (`contract-template.tsx`)
- Wireframes: `qbxvV` + `Klcau` (2-page PDF)
- Page 1: Parties (contractor + homeowner), scope of work, payment terms
- Page 2: Terms & conditions, signature section
- Renders signed date + IP if contract is completed

### Deposit Authorization (`deposit-auth-template.tsx`)
- Based on receipt pattern
- Customer info, property address
- Deposit amount, payment method, authorization date
- Refund terms, application to balance
- Footer

## Data Sources

| Template | Tables Queried |
|----------|---------------|
| Quote Summary | `orders`, `pricing_tiers`, `measurements` |
| Material Order | `orders`, `measurements` (rawResponse for GAF quantities) |
| Contract | `orders`, `contracts`, `documents` |
| Deposit Auth | `orders`, `payments` (where paymentType = 'deposit') |
| Receipt | `payments`, `orders` (existing) |
| Invoice | `orders`, `payments` (existing) |

## Files to Create
- `src/lib/pdf/shared.tsx`
- `src/lib/pdf/quote-template.tsx`
- `src/lib/pdf/materials-template.tsx`
- `src/lib/pdf/contract-template.tsx`
- `src/lib/pdf/deposit-auth-template.tsx`
- `src/app/api/portal/documents/[id]/pdf/route.ts`

## Files to Modify
- `src/lib/pdf/receipt-template.tsx` — use shared header/footer
- `src/lib/pdf/invoice-template.tsx` — use shared header/footer
- `src/app/portal/documents/page.tsx` — integrate DocumentViewer modal, wire real data
- `src/components/features/documents/DocumentViewer.tsx` — wire download to PDF API
- `src/app/api/portal/documents/route.ts` — include all doc types in listing
