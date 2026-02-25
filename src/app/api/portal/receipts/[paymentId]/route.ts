import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { db, schema, eq } from '@/db/index';
import { logger } from '@/lib/utils';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import { ReceiptDocument, type ReceiptData } from '@/lib/pdf/receipt-template';

/**
 * GET /api/portal/receipts/[paymentId]
 * Generate and return a branded PDF receipt for a payment.
 * Auth: Clerk user must own the order associated with the payment.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
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

    const { paymentId } = await params;

    // Fetch payment with its order
    const payment = await db.query.payments.findFirst({
      where: eq(schema.payments.id, paymentId),
      with: {
        order: true,
      },
    });

    if (!payment || !payment.order) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify the user owns this order (skip in dev bypass)
    if (!DEV_BYPASS_ENABLED && payment.order.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build receipt data
    const order = payment.order;
    const receiptData: ReceiptData = {
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

    // Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReceiptDocument, { data: receiptData }) as any
    );

    // Return PDF response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${order.confirmationNumber}-${payment.type}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('Receipt generation failed', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
