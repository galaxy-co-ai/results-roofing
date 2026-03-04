import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import { formatDate } from '@/lib/pdf/shared';
// PDF templates
import { QuoteDocument, type QuoteData, type QuoteLineItem } from '@/lib/pdf/quote-template';
import { MaterialsPdfDocument, type MaterialsData, type MaterialItem } from '@/lib/pdf/materials-template';
import { ContractPdfDocument, type ContractData } from '@/lib/pdf/contract-template';
import { DepositAuthDocument, type DepositAuthData } from '@/lib/pdf/deposit-auth-template';
import { ReceiptDocument, type ReceiptData } from '@/lib/pdf/receipt-template';
import { InvoiceDocument, type InvoiceData } from '@/lib/pdf/invoice-template';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build quote line items from measurement data + pricing tier */
function buildQuoteLineItems(
  measurement: { sqftTotal: string | null; ridgeLengthFt: string | null; eaveLengthFt: string | null },
  tier: { materialPricePerSqft: string; laborPricePerSqft: string; shingleType: string; shingleBrand: string | null; underlaymentType: string | null },
): { materials: QuoteLineItem[]; labor: QuoteLineItem[]; materialTotal: number; laborTotal: number } {
  const sqft = parseFloat(measurement.sqftTotal || '0');
  const squares = Math.ceil(sqft / 100);
  const ridgeFt = parseFloat(measurement.ridgeLengthFt || '0');
  const eaveFt = parseFloat(measurement.eaveLengthFt || '0');
  const matRate = parseFloat(tier.materialPricePerSqft);
  const labRate = parseFloat(tier.laborPricePerSqft);

  const materials: QuoteLineItem[] = [
    { name: `${tier.shingleBrand || 'GAF'} ${tier.shingleType}`, qty: squares, unit: 'squares', amount: squares * matRate * 0.45 },
    { name: tier.underlaymentType || 'Synthetic Underlayment', qty: squares, unit: 'squares', amount: squares * matRate * 0.15 },
    { name: 'Starter Strip', qty: Math.ceil(eaveFt / 33), unit: 'bundles', amount: squares * matRate * 0.08 },
    { name: 'Leak Barrier', qty: Math.ceil(eaveFt / 36), unit: 'rolls', amount: squares * matRate * 0.10 },
    { name: 'Ridge Cap', qty: Math.ceil(ridgeFt / 20), unit: 'bundles', amount: squares * matRate * 0.08 },
    { name: 'Drip Edge', qty: Math.ceil(eaveFt / 10), unit: 'pieces', amount: squares * matRate * 0.06 },
    { name: 'Roofing Nails', qty: squares, unit: 'squares', amount: squares * matRate * 0.04 },
    { name: 'Ventilation', qty: Math.max(1, Math.ceil(sqft / 300)), unit: 'units', amount: squares * matRate * 0.04 },
  ];

  const labor: QuoteLineItem[] = [
    { name: 'Tear-off & Disposal', qty: squares, unit: 'squares', amount: squares * labRate * 0.30 },
    { name: 'Installation', qty: squares, unit: 'squares', amount: squares * labRate * 0.55 },
    { name: 'Cleanup & Final Inspection', qty: 1, unit: 'job', amount: squares * labRate * 0.15 },
  ];

  const materialTotal = materials.reduce((sum, m) => sum + m.amount, 0);
  const laborTotal = labor.reduce((sum, l) => sum + l.amount, 0);

  return { materials, labor, materialTotal, laborTotal };
}

/** Build material items from measurement data */
function buildMaterialItems(
  tier: { shingleType: string; shingleBrand: string | null; underlaymentType: string | null },
  measurement: { sqftTotal: string | null; ridgeLengthFt: string | null; eaveLengthFt: string | null },
): MaterialItem[] {
  const sqft = parseFloat(measurement.sqftTotal || '0');
  const squares = Math.ceil(sqft / 100);
  const ridgeFt = parseFloat(measurement.ridgeLengthFt || '0');
  const eaveFt = parseFloat(measurement.eaveLengthFt || '0');
  const brand = tier.shingleBrand || 'GAF';

  return [
    { material: 'Shingles', brand, color: 'Charcoal', qty: squares * 3, unit: 'bundles' },
    { material: 'Underlayment', brand, color: '', qty: squares, unit: 'rolls' },
    { material: 'Starter Strip', brand, color: '', qty: Math.ceil(eaveFt / 33), unit: 'bundles' },
    { material: 'Leak Barrier', brand, color: '', qty: Math.ceil(eaveFt / 36), unit: 'rolls' },
    { material: 'Ridge Cap', brand, color: 'Charcoal', qty: Math.ceil(ridgeFt / 20), unit: 'bundles' },
    { material: 'Drip Edge', brand: 'Amerimax', color: 'Brown', qty: Math.ceil(eaveFt / 10), unit: 'pieces' },
    { material: 'Roofing Nails', brand: 'Grip-Rite', color: '', qty: squares, unit: 'boxes' },
    { material: 'Ventilation', brand, color: '', qty: Math.max(1, Math.ceil(sqft / 300)), unit: 'units' },
  ];
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

/**
 * GET /api/portal/documents/[id]/pdf
 * Generates a branded PDF for any document type.
 *
 * The `id` param can be:
 * - A real document UUID (contract, deposit_auth, receipt)
 * - A synthetic ID like `quote-{orderId}`, `materials-{orderId}`, `deposit-auth-{orderId}`
 *
 * Query params:
 * - `type` — override for synthetic docs: quote, materials, deposit_auth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth
    let userId: string | null = null;
    if (DEV_BYPASS_ENABLED) {
      userId = MOCK_USER.id;
    } else {
      const authResult = await auth();
      userId = authResult.userId;
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const docType = request.nextUrl.searchParams.get('type');

    // 2. Handle synthetic document types (generated from order data, not stored in DB)
    if (docType === 'quote' || id.startsWith('quote-')) {
      return handleQuotePdf(id, docType, userId);
    }
    if (docType === 'materials' || id.startsWith('materials-')) {
      return handleMaterialsPdf(id, docType, userId);
    }
    if (docType === 'deposit_auth' || id.startsWith('deposit-auth-')) {
      return handleDepositAuthPdf(id, userId);
    }

    // 3. Look up real document from DB
    const doc = await db.query.documents.findFirst({
      where: eq(schema.documents.id, id),
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Find the order for this document (via quoteId)
    const order = doc.quoteId
      ? await db.query.orders.findFirst({
          where: eq(schema.orders.quoteId, doc.quoteId),
          with: { contract: true, payments: true },
        })
      : null;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership
    if (!DEV_BYPASS_ENABLED && order.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Route to correct template
    switch (doc.type) {
      case 'contract':
        return renderContractPdf(order);

      case 'deposit_authorization':
        return renderDepositAuthFromOrder(order);

      case 'receipt': {
        // Find the payment associated with this receipt doc
        const payment = order.payments?.[0];
        if (!payment) {
          return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }
        return renderReceiptPdf(order, payment);
      }

      case 'invoice': {
        // Find invoice for this order
        const invoice = await db.query.invoices.findFirst({
          where: eq(schema.invoices.orderId, order.id),
        });
        if (!invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }
        return renderInvoicePdf(order, invoice);
      }

      default:
        return NextResponse.json(
          { error: `Unsupported document type: ${doc.type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('PDF generation failed', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

async function handleQuotePdf(id: string, docType: string | null, userId: string) {
  const orderId = docType === 'quote' ? id : id.replace('quote-', '');
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!DEV_BYPASS_ENABLED && order.clerkUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const measurement = await db.query.measurements.findFirst({
    where: eq(schema.measurements.quoteId, order.quoteId),
  });
  const tier = await db.query.pricingTiers.findFirst({
    where: eq(schema.pricingTiers.tier, order.selectedTier),
  });

  if (!measurement || !tier) {
    return NextResponse.json({ error: 'Data not available' }, { status: 404 });
  }

  const { materials, labor, materialTotal, laborTotal } = buildQuoteLineItems(measurement, tier);
  const grandTotal = parseFloat(order.totalPrice);

  const data: QuoteData = {
    confirmationNumber: order.confirmationNumber,
    date: order.createdAt,
    customerName: order.customerName || 'Valued Customer',
    propertyAddress: order.propertyAddress,
    propertyCity: order.propertyCity,
    propertyState: order.propertyState,
    propertyZip: order.propertyZip,
    selectedTier: order.selectedTier,
    materials,
    labor,
    materialTotal,
    laborTotal,
    grandTotal,
  };

  return renderPdf(
    React.createElement(QuoteDocument, { data }),
    `estimate-${order.confirmationNumber}.pdf`
  );
}

async function handleMaterialsPdf(id: string, docType: string | null, userId: string) {
  const orderId = docType === 'materials' ? id : id.replace('materials-', '');
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!DEV_BYPASS_ENABLED && order.clerkUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const measurement = await db.query.measurements.findFirst({
    where: eq(schema.measurements.quoteId, order.quoteId),
  });
  const tier = await db.query.pricingTiers.findFirst({
    where: eq(schema.pricingTiers.tier, order.selectedTier),
  });

  if (!measurement || !tier) {
    return NextResponse.json({ error: 'Data not available' }, { status: 404 });
  }

  const data: MaterialsData = {
    confirmationNumber: order.confirmationNumber,
    date: order.createdAt,
    propertyAddress: order.propertyAddress,
    propertyCity: order.propertyCity,
    propertyState: order.propertyState,
    propertyZip: order.propertyZip,
    items: buildMaterialItems(tier, measurement),
  };

  return renderPdf(
    React.createElement(MaterialsPdfDocument, { data }),
    `materials-${order.confirmationNumber}.pdf`
  );
}

async function handleDepositAuthPdf(id: string, userId: string) {
  const orderId = id.startsWith('deposit-auth-') ? id.replace('deposit-auth-', '') : id;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
    with: { payments: true },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!DEV_BYPASS_ENABLED && order.clerkUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return renderDepositAuthFromOrder(order);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderContractPdf(order: any) {
  const contract = order.contract || await db.query.contracts.findFirst({
    where: eq(schema.contracts.id, order.contractId),
  });

  const data: ContractData = {
    contractNumber: order.confirmationNumber,
    date: contract?.createdAt || order.createdAt,
    customerName: order.customerName || 'Valued Customer',
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone || '',
    propertyAddress: order.propertyAddress,
    propertyCity: order.propertyCity,
    propertyState: order.propertyState,
    propertyZip: order.propertyZip,
    selectedTier: order.selectedTier,
    totalPrice: parseFloat(order.totalPrice),
    depositAmount: parseFloat(order.depositAmount),
    balanceDue: parseFloat(order.balanceDue),
    scheduledStartDate: order.scheduledStartDate
      ? formatDate(order.scheduledStartDate)
      : null,
    status: contract?.status || 'draft',
    signedAt: contract?.signedAt || null,
    signatureText: contract?.signatureText || null,
    signatureIp: contract?.signatureIp || null,
  };

  return renderPdf(
    React.createElement(ContractPdfDocument, { data }),
    `contract-${order.confirmationNumber}.pdf`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderDepositAuthFromOrder(order: any) {
  const payments = order.payments || await db.query.payments.findMany({
    where: eq(schema.payments.orderId, order.id),
  });
  const deposit = payments.find((p: { type: string }) => p.type === 'deposit');

  const data: DepositAuthData = {
    confirmationNumber: order.confirmationNumber,
    date: deposit?.processedAt || deposit?.createdAt || order.createdAt,
    customerName: order.customerName || 'Valued Customer',
    customerEmail: order.customerEmail,
    propertyAddress: order.propertyAddress,
    propertyCity: order.propertyCity,
    propertyState: order.propertyState,
    propertyZip: order.propertyZip,
    depositAmount: parseFloat(order.depositAmount),
    totalPrice: parseFloat(order.totalPrice),
    cardBrand: deposit?.cardBrand || null,
    cardLast4: deposit?.cardLast4 || null,
    selectedTier: order.selectedTier,
  };

  return renderPdf(
    React.createElement(DepositAuthDocument, { data }),
    `deposit-auth-${order.confirmationNumber}.pdf`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderReceiptPdf(order: any, payment: any) {
  const data: ReceiptData = {
    paymentId: payment.id,
    amount: parseFloat(payment.amount),
    paymentType: payment.type,
    cardBrand: payment.cardBrand,
    cardLast4: payment.cardLast4,
    processedAt: payment.processedAt || payment.createdAt,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    confirmationNumber: order.confirmationNumber,
    selectedTier: order.selectedTier,
    totalPrice: parseFloat(order.totalPrice),
    customerName: order.customerName || 'Valued Customer',
    propertyAddress: order.propertyAddress,
    propertyCity: order.propertyCity,
    propertyState: order.propertyState,
    propertyZip: order.propertyZip,
    customerEmail: order.customerEmail,
  };

  return renderPdf(
    React.createElement(ReceiptDocument, { data }),
    `receipt-${order.confirmationNumber}-${payment.type}.pdf`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderInvoicePdf(order: any, invoice: any) {
  const allPayments = await db.query.payments.findMany({
    where: eq(schema.payments.orderId, order.id),
  });
  const totalPaid = allPayments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const data: InvoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.createdAt,
    dueDate: invoice.dueDate,
    status: invoice.status,
    customerName: order.customerName || 'Valued Customer',
    propertyAddress: order.propertyAddress,
    propertyCity: order.propertyCity,
    propertyState: order.propertyState,
    propertyZip: order.propertyZip,
    customerEmail: order.customerEmail,
    selectedTier: order.selectedTier,
    totalPrice: parseFloat(order.totalPrice),
    depositAmount: parseFloat(order.depositAmount),
    invoiceType: invoice.type,
    invoiceAmount: parseFloat(invoice.amount),
    totalPaid,
    confirmationNumber: order.confirmationNumber,
    portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://resultsroofing.com'}/portal`,
  };

  return renderPdf(
    React.createElement(InvoiceDocument, { data }),
    `invoice-${invoice.invoiceNumber}.pdf`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderPdf(element: any, filename: string) {
  const pdfBuffer = await renderToBuffer(element);
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
