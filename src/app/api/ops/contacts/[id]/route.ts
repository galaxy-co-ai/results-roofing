import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { getContact, updateContact, deleteContact } from '@/lib/ghl';

const updateContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  companyName: z.string().optional(),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  dnd: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ops/contacts/[id]
 * Get a single contact
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    // Return mock data if GHL not configured
    return NextResponse.json({
      contact: {
        id,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        city: 'Austin',
        state: 'TX',
        tags: ['lead'],
        source: 'website',
        dateAdded: new Date().toISOString(),
      },
      mock: true,
    });
  }

  try {
    const contact = await getContact(id);
    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to fetch contact:', error);
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
  }
}

/**
 * PUT /api/ops/contacts/[id]
 * Update a contact
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const validated = updateContactSchema.parse(body);

    const contact = await updateContact({ id, ...validated });
    return NextResponse.json({ contact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/contacts/[id]
 * Delete a contact
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 });
  }

  try {
    await deleteContact(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
