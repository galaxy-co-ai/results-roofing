import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, schema } from '@/db/index';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, zip, state } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Get IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert out-of-area lead
    const [lead] = await db
      .insert(schema.outOfAreaLeads)
      .values({
        email: email.toLowerCase().trim(),
        zip: zip || null,
        state: state?.toUpperCase() || null,
        ipAddress,
        userAgent,
      })
      .returning();

    return NextResponse.json({
      success: true,
      id: lead.id,
    });
  } catch (error) {
    console.error('Error saving out-of-area lead:', error);
    return NextResponse.json(
      { error: 'Failed to save your information' },
      { status: 500 }
    );
  }
}
