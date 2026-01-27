import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';
import { TCPA_CONSENT_TEXT } from '@/lib/constants';
import { logger } from '@/lib/utils';

interface ContactRequestBody {
  phone: string;
  smsConsent?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;
    const body: ContactRequestBody = await request.json();

    if (!body.phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Find the quote
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, quoteId),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (!quote.leadId) {
      return NextResponse.json(
        { error: 'Quote has no associated lead' },
        { status: 400 }
      );
    }

    const leadId = quote.leadId;

    // Update the lead with phone number
    await db
      .update(schema.leads)
      .set({ phone: body.phone })
      .where(eq(schema.leads.id, leadId));

    // Create SMS consent record if consented
    if (body.smsConsent) {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await db.insert(schema.smsConsents).values({
        leadId,
        phone: body.phone,
        consentGiven: true,
        consentSource: 'checkout_form',
        consentText: TCPA_CONSENT_TEXT,
        ipAddress,
        userAgent,
      });

      logger.info('SMS consent recorded at checkout', { quoteId, phone: body.phone });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error saving contact info', error);
    return NextResponse.json(
      { error: 'Failed to save contact information' },
      { status: 500 }
    );
  }
}
