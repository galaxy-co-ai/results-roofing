import { NextRequest, NextResponse } from 'next/server';
import { db, schema, eq } from '@/db/index';

const SERVICE_STATES = ['TX', 'GA', 'NC', 'AZ'];

interface AddressParts {
  address: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Parse a full address string into components
 * Expected format: "123 Main St, City, State ZIP" or "123 Main St, City, State, ZIP"
 */
function parseAddress(fullAddress: string): AddressParts | null {
  // Remove extra whitespace and normalize
  const normalized = fullAddress.trim().replace(/\s+/g, ' ');

  // Try to extract ZIP code (5 digits, optionally with -4 extension)
  const zipMatch = normalized.match(/\b(\d{5}(?:-\d{4})?)\s*$/);
  if (!zipMatch) return null;

  const zip = zipMatch[1];
  const withoutZip = normalized.slice(0, -zipMatch[0].length).trim();

  // Try to extract state (2-letter abbreviation)
  const stateMatch = withoutZip.match(/,?\s*([A-Z]{2})\s*$/i);
  if (!stateMatch) return null;

  const state = stateMatch[1].toUpperCase();
  const withoutState = withoutZip.slice(0, -stateMatch[0].length).trim();

  // Split remaining by comma to get street address and city
  const parts = withoutState.split(',').map((p) => p.trim());
  if (parts.length < 2) return null;

  const city = parts.pop()!;
  const address = parts.join(', ');

  return { address, city, state, zip };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address: fullAddress } = body;

    if (!fullAddress || typeof fullAddress !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Parse the address
    const parsed = parseAddress(fullAddress);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid address format. Please enter a complete address with city, state, and ZIP.' },
        { status: 400 }
      );
    }

    // Check if state is in service area
    if (!SERVICE_STATES.includes(parsed.state)) {
      return NextResponse.json(
        { error: `Sorry, we currently only serve ${SERVICE_STATES.join(', ')}. Your state (${parsed.state}) is not in our service area.` },
        { status: 400 }
      );
    }

    // Create lead first
    const [lead] = await db
      .insert(schema.leads)
      .values({
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
      })
      .returning();

    // Create quote linked to lead
    const [quote] = await db
      .insert(schema.quotes)
      .values({
        leadId: lead.id,
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
        status: 'preliminary',
        // Set expiration to 30 days from now
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .returning();

    return NextResponse.json({
      id: quote.id,
      status: quote.status,
      address: {
        street: quote.address,
        city: quote.city,
        state: quote.state,
        zip: quote.zip,
      },
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Quote ID is required' },
      { status: 400 }
    );
  }

  try {
    const quote = await db.query.quotes.findFirst({
      where: eq(schema.quotes.id, id),
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
