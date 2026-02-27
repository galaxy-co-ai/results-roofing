import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import { InvoiceDocument, type InvoiceData } from '@/lib/pdf/invoice-template';

/**
 * GET /api/invoices/[id]/pdf
 * Generate and return a branded PDF invoice.
 * Auth: Clerk user must be authenticated (admin or portal owner check can be added later).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
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

    const { id: invoiceId } = await params;

    // Fetch invoice with order and payments
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
      customerName: order.customerName || 'Valued Customer',
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

    // Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoiceDocument, { data: invoiceData }) as any
    );

    // Return PDF response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('[Invoice PDF] Generation failed', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
