import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import {
  listContacts,
  createContact,
  searchContacts,
} from '@/lib/ghl';

const createContactSchema = z.object({
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
});

/**
 * GET /api/ops/contacts
 * List or search contacts
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    // Return mock data if GHL not configured
    return NextResponse.json({
      contacts: getMockContacts(),
      meta: { total: 10 },
      mock: true,
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = query
      ? await searchContacts(query, { limit })
      : await listContacts({ limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json(
      { error: 'GHL not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const validated = createContactSchema.parse(body);

    // Require at least email or phone
    if (!validated.email && !validated.phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    const contact = await createContact(validated);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to create contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockContacts() {
  return [
    {
      id: 'mock-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      city: 'Austin',
      state: 'TX',
      tags: ['lead', 'roof-replacement'],
      source: 'website',
      dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 234-5678',
      city: 'Dallas',
      state: 'TX',
      tags: ['customer', 'referral'],
      source: 'referral',
      dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-3',
      firstName: 'Mike',
      lastName: 'Brown',
      email: 'mike.brown@example.com',
      phone: '+1 (555) 345-6789',
      city: 'Houston',
      state: 'TX',
      tags: ['lead'],
      source: 'google',
      dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 456-7890',
      city: 'San Antonio',
      state: 'TX',
      tags: ['customer', 'maintenance'],
      source: 'website',
      dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.w@example.com',
      phone: '+1 (555) 567-8901',
      city: 'Fort Worth',
      state: 'TX',
      tags: ['lead', 'storm-damage'],
      source: 'facebook',
      dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
