import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema } from '@/db/index';
import { logger } from '@/lib/utils';
import { rateLimiters, getRequestIdentifier, rateLimitHeaders } from '@/lib/api/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const identifier = getRequestIdentifier(request);
    const rateLimitResult = rateLimiters.leadCapture.check(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const { serviceType, address, city, state, zip, name, phone, email, message } = body;

    // Validate required fields
    if (!serviceType || typeof serviceType !== 'string') {
      return NextResponse.json({ error: 'Service type is required' }, { status: 400 });
    }
    if (!address || !city || !state || !zip) {
      return NextResponse.json({ error: 'Complete address is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Split name into first/last
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const [lead] = await db
      .insert(schema.leads)
      .values({
        email: email.toLowerCase().trim(),
        phone: phone.replace(/\D/g, ''),
        firstName,
        lastName: lastName || null,
        address: address.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zip: zip.trim(),
        serviceType,
        notes: message?.trim() || null,
        utmSource: 'contact_form',
      })
      .returning();

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    logger.error('Error saving contact form submission', error);
    return NextResponse.json(
      { error: 'Failed to save your information' },
      { status: 500 }
    );
  }
}
