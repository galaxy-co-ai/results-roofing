# Invoicing System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a branded invoice system that auto-generates invoices on contract signing and payment, syncs to GHL pipelines, and lets customers view/pay invoices through the portal.

**Architecture:** Invoices are a new first-class entity linking orders → payments. Auto-generated at two trigger points (contract signed, deposit paid). PDF template extends the existing `@react-pdf/renderer` receipt pattern. GHL sync uses the existing pipelines API. No Stripe Invoicing — we own the invoice layer, Stripe remains the payment rail only.

**Tech Stack:** Drizzle ORM (Neon), `@react-pdf/renderer`, Resend (email), GHL Pipelines API, Next.js API routes

**Branch:** `feat/invoicing-system`

**Cut from v1:** Custom ops-created invoices, "viewed" tracking, PDF email attachment, logo image in PDF

---

## Phase 1: Database Schema + Queries

> New `invoices` table + query helpers. No UI, no triggers yet.

### Task 1.1: Create invoices schema

**Files:**
- Create: `src/db/schema/invoices.ts`

**Step 1: Write the schema**

```typescript
import { pgTable, uuid, text, decimal, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { payments } from './payments';

export const invoiceTypeEnum = pgEnum('invoice_type', [
  'deposit',
  'balance',
  'full',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'void',
]);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    paymentId: uuid('payment_id')
      .references(() => payments.id),
    invoiceNumber: text('invoice_number').notNull().unique(),
    type: invoiceTypeEnum('type').notNull(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    // CRM sync references
    ghlContactId: text('ghl_contact_id'),
    ghlOpportunityId: text('ghl_opportunity_id'),
    notes: text('notes'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('invoices_order_idx').on(table.orderId),
    index('invoices_payment_idx').on(table.paymentId),
    index('invoices_status_idx').on(table.status),
    index('invoices_number_idx').on(table.invoiceNumber),
  ]
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
```

**Step 2: Register in schema index**

- Modify: `src/db/schema/index.ts`
- Add `export * from './invoices';` after the payments export (line 7)

**Step 3: Add relations**

- Modify: `src/db/schema/relations.ts`
- Import `invoices` from `./invoices`
- Add `invoicesRelations`:
```typescript
export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  payment: one(payments, {
    fields: [invoices.paymentId],
    references: [payments.id],
  }),
}));
```
- Add `invoices: many(invoices)` to `ordersRelations`
- Add `invoice: one(invoices)` to `paymentsRelations`

**Step 4: Push schema to Neon**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npm run db:push -- --force`

**Step 5: Verify in Drizzle Studio**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx drizzle-kit studio`
Expected: `invoices` table visible with all columns.

**Step 6: Commit**

```bash
git add src/db/schema/invoices.ts src/db/schema/index.ts src/db/schema/relations.ts
git commit -m "feat(invoicing): add invoices table schema and relations"
```

---

### Task 1.2: Invoice number generator + query helpers

**Files:**
- Create: `src/lib/invoicing/index.ts`

**Step 1: Write the module**

This module provides:
- `generateInvoiceNumber()` — sequential `RR-INV-000001` format (queries DB for last number)
- `createInvoice(params)` — insert + return full invoice
- `getInvoicesByOrder(orderId)` — list invoices for an order
- `getInvoiceById(id)` — single invoice with order + payment data
- `updateInvoiceStatus(id, status, fields?)` — status transitions
- `linkPaymentToInvoice(invoiceId, paymentId)` — called after payment succeeds

```typescript
import { db, schema, eq, desc } from '@/db/index';
import { logger } from '@/lib/utils';
import type { NewInvoice } from '@/db/schema/invoices';

/**
 * Generate next sequential invoice number: RR-INV-000001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const latest = await db.query.invoices.findFirst({
    orderBy: [desc(schema.invoices.createdAt)],
    columns: { invoiceNumber: true },
  });

  let nextNum = 1;
  if (latest?.invoiceNumber) {
    const match = latest.invoiceNumber.match(/RR-INV-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `RR-INV-${String(nextNum).padStart(6, '0')}`;
}

/**
 * Create a new invoice
 */
export async function createInvoice(params: {
  orderId: string;
  type: 'deposit' | 'balance' | 'full';
  amount: number;
  dueDate?: Date;
  notes?: string;
}): Promise<typeof schema.invoices.$inferSelect> {
  const invoiceNumber = await generateInvoiceNumber();

  const [invoice] = await db
    .insert(schema.invoices)
    .values({
      orderId: params.orderId,
      invoiceNumber,
      type: params.type,
      status: 'draft',
      amount: params.amount.toString(),
      dueDate: params.dueDate ?? null,
      notes: params.notes ?? null,
    })
    .returning();

  logger.info('[Invoicing] Invoice created', {
    invoiceId: invoice.id,
    invoiceNumber,
    orderId: params.orderId,
    type: params.type,
    amount: params.amount,
  });

  return invoice;
}

/**
 * Get all invoices for an order
 */
export async function getInvoicesByOrder(orderId: string) {
  return db.query.invoices.findMany({
    where: eq(schema.invoices.orderId, orderId),
    with: { payment: true },
    orderBy: [desc(schema.invoices.createdAt)],
  });
}

/**
 * Get single invoice with order + payment
 */
export async function getInvoiceById(invoiceId: string) {
  return db.query.invoices.findFirst({
    where: eq(schema.invoices.id, invoiceId),
    with: { order: true, payment: true },
  });
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'void',
  fields?: { paidAt?: Date; sentAt?: Date; paymentId?: string }
) {
  await db
    .update(schema.invoices)
    .set({
      status,
      ...fields,
      updatedAt: new Date(),
    })
    .where(eq(schema.invoices.id, invoiceId));

  logger.info('[Invoicing] Invoice status updated', { invoiceId, status });
}

/**
 * Link a payment to an invoice and mark it paid
 */
export async function linkPaymentToInvoice(invoiceId: string, paymentId: string) {
  await updateInvoiceStatus(invoiceId, 'paid', {
    paymentId,
    paidAt: new Date(),
  });
}
```

**Step 2: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors in new files.

**Step 3: Commit**

```bash
git add src/lib/invoicing/index.ts
git commit -m "feat(invoicing): add invoice number generator and query helpers"
```

---

## Phase 2: Invoice PDF Template

> Branded PDF matching the existing receipt template style.

### Task 2.1: Create invoice PDF template

**Files:**
- Create: `src/lib/pdf/invoice-template.tsx`

**Step 1: Write the template**

Extends the receipt template pattern. Key differences from receipt:
- Title: "Invoice" not "Payment Receipt"
- Shows invoice number + due date (not payment confirmation)
- Shows "Amount Due" instead of "Total Paid"
- Shows status badge (PAID / UNPAID)
- Multi-row line items table (tier description + optional line items)
- Shows deposit paid / balance remaining breakdown
- Portal pay link in footer when unpaid

```typescript
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1E2329',
  },
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
    marginVertical: 16,
  },
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
  // Customer
  customerName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  customerEmail: string;
  // Line items
  selectedTier: string;
  totalPrice: number;
  depositAmount: number;
  // This invoice
  invoiceType: 'deposit' | 'balance' | 'full';
  invoiceAmount: number;
  // Payments made
  totalPaid: number;
  // Order
  confirmationNumber: string;
  // Portal link (for footer CTA)
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

function tierLabel(tier: string): string {
  const labels: Record<string, string> = {
    good: 'Standard Package',
    better: 'Preferred Package',
    best: 'Premium Package',
  };
  return labels[tier] || tier.charAt(0).toUpperCase() + tier.slice(1) + ' Package';
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
  const balanceDue = data.totalPrice - data.totalPaid;

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
            {formatCurrency(isPaid ? data.invoiceAmount : data.invoiceAmount)}
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
```

**Step 2: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/lib/pdf/invoice-template.tsx
git commit -m "feat(invoicing): add branded invoice PDF template"
```

---

### Task 2.2: Create invoice PDF API route

**Files:**
- Create: `src/app/api/invoices/[id]/pdf/route.ts`

**Step 1: Write the route**

Pattern matches `src/app/api/portal/receipts/[paymentId]/route.ts`. Clerk auth + ownership check.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db/index';
import { InvoiceDocument, type InvoiceData } from '@/lib/pdf/invoice-template';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    // Auth check
    let userEmail: string | null = null;
    if (DEV_BYPASS_ENABLED) {
      userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
    } else {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Look up email from Clerk userId via order's clerkUserId
    }

    // Fetch invoice with order and payment
    const invoice = await db.query.invoices.findFirst({
      where: eq(schema.invoices.id, invoiceId),
      with: {
        order: {
          with: { payments: true },
        },
        payment: true,
      },
    });

    if (!invoice || !invoice.order) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const order = invoice.order;
    const totalPaid = order.payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.resultsroofing.com'}/portal/payments`;

    const invoiceData: InvoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status as InvoiceData['status'],
      customerName: order.customerName || 'Customer',
      propertyAddress: order.propertyAddress,
      propertyCity: order.propertyCity,
      propertyState: order.propertyState,
      propertyZip: order.propertyZip,
      customerEmail: order.customerEmail,
      selectedTier: order.selectedTier,
      totalPrice: parseFloat(order.totalPrice),
      depositAmount: parseFloat(order.depositAmount),
      invoiceType: invoice.type as InvoiceData['invoiceType'],
      invoiceAmount: parseFloat(invoice.amount),
      totalPaid,
      confirmationNumber: order.confirmationNumber,
      portalUrl,
    };

    const buffer = await renderToBuffer(
      React.createElement(InvoiceDocument, { data: invoiceData }) as any
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('[Invoice PDF] Generation failed', error);
    return NextResponse.json({ error: 'Failed to generate invoice PDF' }, { status: 500 });
  }
}
```

**Step 2: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/api/invoices/\[id\]/pdf/route.ts
git commit -m "feat(invoicing): add invoice PDF download API route"
```

---

## Phase 3: Invoice Email Template

> Add `invoice_ready` to the Resend adapter.

### Task 3.1: Add invoice_ready email template

**Files:**
- Modify: `src/lib/integrations/adapters/resend.ts`

**Step 1: Add `invoice_ready` to the `EmailTemplate` type**

At the type definition (~line 31), add `'invoice_ready'` to the union.

**Step 2: Add the template HTML**

In the `templates` record inside `renderTemplate()`, add the `invoice_ready` template. Pattern matches existing templates (same `baseStyles`, same brand gradient header).

```typescript
invoice_ready: `
  <!DOCTYPE html>
  <html>
  <head><style>${baseStyles}</style></head>
  <body>
    <div class="header">
      <h1>Invoice from Results Roofing</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <div class="highlight" style="text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">Amount Due</p>
        <p class="amount">${data.amountFormatted}</p>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Invoice #${data.invoiceNumber}</p>
      </div>
      <p>${data.description || 'Your invoice is ready for payment.'}</p>
      <div style="text-align: center;">
        <a href="${data.portalUrl}" class="button">View & Pay</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">You can also download the PDF from your customer portal.</p>
    </div>
    <div class="footer">
      <p>Results Roofing</p>
      <p>Questions? Reply to this email or call us.</p>
    </div>
  </body>
  </html>
`,
```

**Step 3: Add `sendInvoiceReady` convenience method**

Add to the `resendAdapter` object (alongside `sendPaymentConfirmation` etc.):

```typescript
async sendInvoiceReady(
  to: string,
  data: {
    customerName: string;
    invoiceNumber: string;
    amountFormatted: string;
    description?: string;
    portalUrl: string;
  }
): Promise<EmailResponse> {
  return this.send({
    to,
    subject: `Invoice ${data.invoiceNumber} from Results Roofing`,
    template: 'invoice_ready',
    data,
  });
},
```

**Step 4: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 5: Commit**

```bash
git add src/lib/integrations/adapters/resend.ts
git commit -m "feat(invoicing): add invoice_ready email template to Resend adapter"
```

---

## Phase 4: GHL Pipeline Sync

> Wire invoice events to GHL opportunities.

### Task 4.1: Add invoice sync methods to GHL messaging adapter

**Files:**
- Modify: `src/lib/integrations/adapters/ghl-messaging.ts`

**Step 1: Add invoice-specific methods to `ghlMessagingAdapter`**

Add these methods to the adapter object:

```typescript
/**
 * Send invoice ready SMS
 */
async sendInvoiceReadySms(
  phone: string,
  invoiceNumber: string,
  amount: string
): Promise<GHLMessageResponse> {
  return this.sendSmsByPhone(
    phone,
    `Invoice ${invoiceNumber} for ${amount} is ready. View and pay in your portal: ${process.env.NEXT_PUBLIC_APP_URL || 'https://app.resultsroofing.com'}/portal/payments - Results Roofing`
  );
},

/**
 * Sync invoice event to GHL pipeline
 * Creates or updates an opportunity with invoice data
 */
async syncInvoiceToGHL(params: {
  contactId: string;
  invoiceNumber: string;
  amount: number;
  type: 'deposit' | 'balance' | 'full';
  status: 'sent' | 'paid';
  existingOpportunityId?: string;
}): Promise<{ opportunityId: string; success: boolean; error?: string }> {
  if (!isConfigured()) {
    logger.warn('[GHL Messaging] GHL not configured - invoice sync skipped');
    return { opportunityId: '', success: false, error: 'GHL not configured' };
  }

  try {
    const { createOpportunity, updateOpportunity, listPipelines } = await import('@/lib/ghl/api/pipelines');

    // Get the first pipeline (Results Roofing sales pipeline)
    const { pipelines } = await listPipelines();
    if (!pipelines.length) {
      logger.warn('[GHL Messaging] No pipelines found in GHL');
      return { opportunityId: '', success: false, error: 'No pipelines found' };
    }

    const pipeline = pipelines[0];
    const stages = pipeline.stages || [];

    // Map invoice status to stage name
    const targetStageName = params.status === 'paid'
      ? (params.type === 'balance' || params.type === 'full' ? 'Paid in Full' : 'Deposit Paid')
      : 'Invoice Sent';

    // Find matching stage or use first stage as fallback
    const targetStage = stages.find(s =>
      s.name.toLowerCase().includes(targetStageName.toLowerCase())
    ) || stages[stages.length - 1];

    if (!targetStage) {
      logger.warn('[GHL Messaging] No matching pipeline stage found', { targetStageName });
      return { opportunityId: '', success: false, error: 'No matching stage' };
    }

    if (params.existingOpportunityId) {
      // Update existing opportunity
      const opp = await updateOpportunity({
        id: params.existingOpportunityId,
        pipelineStageId: targetStage.id,
        monetaryValue: params.amount,
        status: params.status === 'paid' && params.type !== 'deposit' ? 'won' : 'open',
      });

      logger.info('[GHL Messaging] Invoice opportunity updated', {
        opportunityId: opp.id,
        stage: targetStage.name,
      });

      return { opportunityId: opp.id, success: true };
    } else {
      // Create new opportunity
      const opp = await createOpportunity({
        name: `${params.invoiceNumber} - Roof Replacement`,
        pipelineId: pipeline.id,
        pipelineStageId: targetStage.id,
        contactId: params.contactId,
        monetaryValue: params.amount,
        status: 'open',
      });

      logger.info('[GHL Messaging] Invoice opportunity created', {
        opportunityId: opp.id,
        stage: targetStage.name,
      });

      return { opportunityId: opp.id, success: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[GHL Messaging] Invoice sync failed', { error: errorMessage });
    return { opportunityId: '', success: false, error: errorMessage };
  }
},
```

**Step 2: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/lib/integrations/adapters/ghl-messaging.ts
git commit -m "feat(invoicing): add invoice SMS and GHL pipeline sync methods"
```

---

## Phase 5: Auto-Generation Triggers

> Wire invoices into the two trigger points: contract signed + payment succeeded.

### Task 5.1: Generate deposit invoice on contract signing

**Files:**
- Modify: `src/app/api/quotes/[id]/deposit-auth/route.ts`

**Step 1: Add invoice generation after contract signing**

After the quote status update to `'signed'` (~line 152) and before the email send (~line 184), add:

```typescript
// Generate deposit invoice
try {
  // Check if order already exists for this quote
  const existingOrder = await db.query.orders.findFirst({
    where: eq(schema.orders.quoteId, quoteId),
  });

  if (existingOrder) {
    const { createInvoice, updateInvoiceStatus } = await import('@/lib/invoicing');

    const depositAmount = parseFloat(existingOrder.depositAmount);
    const invoice = await createInvoice({
      orderId: existingOrder.id,
      type: 'deposit',
      amount: depositAmount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: `Deposit for ${existingOrder.selectedTier} tier roof replacement`,
    });

    // Mark as sent (we're about to email it)
    await updateInvoiceStatus(invoice.id, 'sent', { sentAt: new Date() });

    // Send invoice email
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.resultsroofing.com'}/portal/payments`;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(depositAmount);

    await resendAdapter.sendInvoiceReady(email, {
      customerName: fullName || email,
      invoiceNumber: invoice.invoiceNumber,
      amountFormatted: formattedAmount,
      description: `Your deposit of ${formattedAmount} is due to secure your installation date.`,
      portalUrl,
    });

    // Sync to GHL pipeline
    const crmResult = await ghlMessagingAdapter.syncCustomerToCRM({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      tags: ['contract-signed', 'results-roofing'],
      source: 'results-roofing-contract',
    });

    if (crmResult.success && crmResult.contactId) {
      const ghlResult = await ghlMessagingAdapter.syncInvoiceToGHL({
        contactId: crmResult.contactId,
        invoiceNumber: invoice.invoiceNumber,
        amount: depositAmount,
        type: 'deposit',
        status: 'sent',
      });

      if (ghlResult.success) {
        await db.update(schema.invoices).set({
          ghlContactId: crmResult.contactId,
          ghlOpportunityId: ghlResult.opportunityId,
          updatedAt: new Date(),
        }).where(eq(schema.invoices.id, invoice.id));
      }
    }

    logger.info(`[Deposit Auth] Invoice ${invoice.invoiceNumber} generated and sent for quote ${quoteId}`);
  } else {
    logger.info(`[Deposit Auth] No order exists yet for quote ${quoteId} — invoice will be created on payment`);
  }
} catch (invoiceError) {
  // Non-critical — don't fail contract signing if invoicing fails
  logger.error('[Deposit Auth] Invoice generation failed', invoiceError);
}
```

**Important:** Also add `ghlMessagingAdapter` to the imports at the top of the file:
```typescript
import { resendAdapter, ghlMessagingAdapter } from '@/lib/integrations/adapters';
```

**Step 2: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/api/quotes/\[id\]/deposit-auth/route.ts
git commit -m "feat(invoicing): generate deposit invoice on contract signing"
```

---

### Task 5.2: Generate balance invoice + link payment on webhook

**Files:**
- Modify: `src/app/api/payments/webhook/route.ts`

**Step 1: Import invoicing module**

Add to imports at top of file:
```typescript
import { createInvoice, updateInvoiceStatus, linkPaymentToInvoice, getInvoicesByOrder } from '@/lib/invoicing';
```

**Step 2: In `handlePaymentSuccess`, after the payment record is created (~line 291), add invoice logic**

Insert after the payment record creation block and before the quote status update:

```typescript
// Invoice handling
try {
  const orderInvoices = await getInvoicesByOrder(order.id);

  if (paymentType === 'deposit') {
    // Find existing deposit invoice (created on contract sign) and mark paid
    const depositInvoice = orderInvoices.find(inv => inv.type === 'deposit' && inv.status !== 'paid');
    if (depositInvoice) {
      await linkPaymentToInvoice(depositInvoice.id, payment.id);
      logger.info('[WEBHOOK] Deposit invoice marked paid', { invoiceId: depositInvoice.id });

      // Update GHL opportunity if tracked
      if (depositInvoice.ghlContactId && depositInvoice.ghlOpportunityId) {
        await ghlMessagingAdapter.syncInvoiceToGHL({
          contactId: depositInvoice.ghlContactId,
          invoiceNumber: depositInvoice.invoiceNumber,
          amount: depositAmount,
          type: 'deposit',
          status: 'paid',
          existingOpportunityId: depositInvoice.ghlOpportunityId,
        });
      }
    }

    // If balance is due, auto-generate balance invoice
    if (balanceDue > 0) {
      const balanceInvoice = await createInvoice({
        orderId: order.id,
        type: 'balance',
        amount: balanceDue,
        dueDate: order.scheduledStartDate
          ? new Date(new Date(order.scheduledStartDate).getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days before install
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: `Remaining balance for ${order.selectedTier} tier roof replacement`,
      });

      await updateInvoiceStatus(balanceInvoice.id, 'sent', { sentAt: new Date() });

      // Send balance invoice email
      if (order.customerEmail) {
        const formattedBalance = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(balanceDue);

        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.resultsroofing.com'}/portal/payments`;

        await resendAdapter.sendInvoiceReady(order.customerEmail, {
          customerName: order.customerName || 'Valued Customer',
          invoiceNumber: balanceInvoice.invoiceNumber,
          amountFormatted: formattedBalance,
          description: `Your deposit has been received. The remaining balance of ${formattedBalance} is due before your installation date.`,
          portalUrl,
        });
      }

      // Sync balance invoice to GHL
      const depositInvoiceForGHL = orderInvoices.find(inv => inv.ghlContactId);
      if (depositInvoiceForGHL?.ghlContactId) {
        const ghlResult = await ghlMessagingAdapter.syncInvoiceToGHL({
          contactId: depositInvoiceForGHL.ghlContactId,
          invoiceNumber: balanceInvoice.invoiceNumber,
          amount: balanceDue,
          type: 'balance',
          status: 'sent',
        });

        if (ghlResult.success) {
          await db.update(schema.invoices).set({
            ghlContactId: depositInvoiceForGHL.ghlContactId,
            ghlOpportunityId: ghlResult.opportunityId,
            updatedAt: new Date(),
          }).where(eq(schema.invoices.id, balanceInvoice.id));
        }
      }

      logger.info('[WEBHOOK] Balance invoice generated and sent', {
        invoiceId: balanceInvoice.id,
        invoiceNumber: balanceInvoice.invoiceNumber,
        amount: balanceDue,
      });
    }
  } else {
    // Balance or full payment — find and mark balance invoice paid
    const balanceInvoice = orderInvoices.find(inv =>
      (inv.type === 'balance' || inv.type === 'full') && inv.status !== 'paid'
    );
    if (balanceInvoice) {
      await linkPaymentToInvoice(balanceInvoice.id, payment.id);
      logger.info('[WEBHOOK] Balance invoice marked paid', { invoiceId: balanceInvoice.id });

      // Update GHL opportunity to "won"
      if (balanceInvoice.ghlContactId && balanceInvoice.ghlOpportunityId) {
        await ghlMessagingAdapter.syncInvoiceToGHL({
          contactId: balanceInvoice.ghlContactId,
          invoiceNumber: balanceInvoice.invoiceNumber,
          amount: depositAmount,
          type: 'balance',
          status: 'paid',
          existingOpportunityId: balanceInvoice.ghlOpportunityId,
        });
      }
    }
  }
} catch (invoiceError) {
  // Non-critical — don't fail the webhook if invoicing fails
  logger.error('[WEBHOOK] Invoice handling failed', invoiceError);
}
```

**Note:** The payment record insert needs to capture the returned row. Change the existing insert at ~line 279 from:
```typescript
await db.insert(schema.payments).values({
```
to:
```typescript
const [payment] = await db.insert(schema.payments).values({
  ...
}).returning();
```

**Step 3: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 4: Commit**

```bash
git add src/app/api/payments/webhook/route.ts
git commit -m "feat(invoicing): auto-generate and sync invoices on payment events"
```

---

## Phase 6: Portal Invoice Display

> Show invoices in the customer payments page.

### Task 6.1: Create invoice list API route

**Files:**
- Create: `src/app/api/invoices/route.ts`

**Step 1: Write the route**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/**
 * GET /api/invoices?orderId=xxx
 * List invoices for an order (portal use)
 */
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Auth check
    if (!DEV_BYPASS_ENABLED) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify the order belongs to this user
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        columns: { clerkUserId: true },
      });
      if (!order || order.clerkUserId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    const invoices = await db.query.invoices.findMany({
      where: eq(schema.invoices.orderId, orderId),
      with: { payment: true },
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    logger.error('[Invoices API] List failed', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/invoices/route.ts
git commit -m "feat(invoicing): add invoice list API route"
```

---

### Task 6.2: Create InvoiceCard portal component

**Files:**
- Create: `src/components/features/portal/InvoiceCard/InvoiceCard.tsx`
- Create: `src/components/features/portal/InvoiceCard/InvoiceCard.module.css`
- Create: `src/components/features/portal/InvoiceCard/index.ts`

**Step 1: Write the component**

Shows each invoice as a compact card: invoice number, type badge, amount, status badge, due date, download PDF button.

```typescript
'use client';

import { FileText, Download } from 'lucide-react';
import styles from './InvoiceCard.module.css';

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    type: string;
    status: string;
    amount: string;
    dueDate: string | null;
    createdAt: string;
  };
}

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    deposit: 'Deposit',
    balance: 'Balance',
    full: 'Full Amount',
  };
  return labels[type] || type;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const isPaid = invoice.status === 'paid';

  function handleDownload() {
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  }

  return (
    <div className={styles.card}>
      <div className={styles.iconCol}>
        <FileText size={20} className={styles.icon} />
      </div>
      <div className={styles.details}>
        <div className={styles.topRow}>
          <span className={styles.number}>{invoice.invoiceNumber}</span>
          <span className={`${styles.badge} ${isPaid ? styles.badgePaid : styles.badgeUnpaid}`}>
            {isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
        <div className={styles.meta}>
          <span className={styles.type}>{typeLabel(invoice.type)}</span>
          {invoice.dueDate && !isPaid && (
            <span className={styles.due}>Due {formatDate(invoice.dueDate)}</span>
          )}
        </div>
      </div>
      <div className={styles.amountCol}>
        <span className={styles.amount}>{formatCurrency(invoice.amount)}</span>
        <button
          className={styles.downloadBtn}
          onClick={handleDownload}
          aria-label={`Download invoice ${invoice.invoiceNumber}`}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Write the CSS module**

```css
.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--rr-color-card, #fff);
  border: 1px solid var(--rr-color-border, #E8EDF5);
  border-radius: 6px;
}

.iconCol {
  flex-shrink: 0;
}

.icon {
  color: var(--rr-color-primary, #2563EB);
}

.details {
  flex: 1;
  min-width: 0;
}

.topRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.number {
  font-weight: 600;
  font-size: 14px;
  color: var(--rr-color-foreground, #1E2329);
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badgePaid {
  background: #D1FAE5;
  color: #065F46;
}

.badgeUnpaid {
  background: #FEF3C7;
  color: #92400E;
}

.meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--rr-color-muted, #6B7280);
}

.type {
  /* inherits */
}

.due {
  /* inherits */
}

.amountCol {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.amount {
  font-weight: 600;
  font-size: 16px;
  color: var(--rr-color-foreground, #1E2329);
}

.downloadBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--rr-color-border, #E8EDF5);
  border-radius: 6px;
  background: transparent;
  color: var(--rr-color-muted, #6B7280);
  cursor: pointer;
  transition: all 150ms ease;
}

@media (hover: hover) {
  .downloadBtn:hover {
    background: var(--rr-color-bg, #F7F9FC);
    color: var(--rr-color-primary, #2563EB);
    border-color: var(--rr-color-primary, #2563EB);
  }
}
```

**Step 3: Write the barrel export**

```typescript
export { InvoiceCard } from './InvoiceCard';
```

**Step 4: Commit**

```bash
git add src/components/features/portal/InvoiceCard/
git commit -m "feat(invoicing): add InvoiceCard portal component"
```

---

### Task 6.3: Wire invoices into portal payments page

**Files:**
- Modify: `src/app/portal/payments/page.tsx`

**Step 1: Add invoice fetching**

In `PaymentsLedger`, add a fetch for invoices using the order ID. Use the existing `useQuery` pattern from the portal:

```typescript
import { useQuery } from '@tanstack/react-query';
import { InvoiceCard } from '@/components/features/portal/InvoiceCard';
```

Inside `PaymentsLedger`, after the existing data destructuring:

```typescript
const { data: invoiceData } = useQuery({
  queryKey: ['invoices', orderId],
  queryFn: async () => {
    const res = await fetch(`/api/invoices?orderId=${orderId}`);
    if (!res.ok) return { invoices: [] };
    return res.json();
  },
  enabled: !!orderId,
});

const invoiceList = invoiceData?.invoices || [];
```

**Step 2: Add invoices section to the JSX**

Insert a new section between the Payment Progress Card and Payment Options sections:

```tsx
{/* Invoices */}
{invoiceList.length > 0 && (
  <section aria-label="Invoices" className={styles.invoicesSection}>
    <h3 className={styles.sectionTitle}>Invoices</h3>
    <div className={styles.invoicesList}>
      {invoiceList.map((inv: any) => (
        <InvoiceCard key={inv.id} invoice={inv} />
      ))}
    </div>
  </section>
)}
```

**Step 3: Add CSS for the invoices section**

In `src/app/portal/payments/page.module.css`, add:

```css
.invoicesSection {
  margin-bottom: 24px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--rr-color-muted, #6B7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.invoicesList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

**Step 4: Verify TypeScript**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 5: Commit**

```bash
git add src/app/portal/payments/page.tsx src/app/portal/payments/page.module.css
git commit -m "feat(invoicing): display invoices in portal payments page"
```

---

## Phase 7: Build Verification + Typecheck

### Task 7.1: Full build verification

**Step 1: Run typecheck**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npm run typecheck`
Expected: 0 errors

**Step 2: Run build**

Run: `cd "C:/Users/Owner/workspace/results-roofing" && npm run build`
Expected: Build succeeds

**Step 3: Fix any issues found**

If build fails, fix the specific errors — likely type mismatches at integration boundaries (invoice query return types, nullable fields).

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve build errors in invoicing system"
```

---

## Summary: What Gets Built

| Phase | What | Files |
|-------|------|-------|
| 1 | Schema + queries | `invoices.ts`, `relations.ts`, `index.ts`, `src/lib/invoicing/index.ts` |
| 2 | PDF template + API | `invoice-template.tsx`, `api/invoices/[id]/pdf/route.ts` |
| 3 | Email template | `resend.ts` (modified) |
| 4 | GHL sync | `ghl-messaging.ts` (modified) |
| 5 | Auto-triggers | `deposit-auth/route.ts`, `webhook/route.ts` (modified) |
| 6 | Portal UI | `InvoiceCard/`, `invoices/route.ts`, `payments/page.tsx` (modified) |
| 7 | Verification | Build + typecheck pass |

**Estimated commits:** 9
**Dependencies:** None — all builds on existing infrastructure
