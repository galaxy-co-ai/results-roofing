import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { eq, desc, sql } from 'drizzle-orm';
import * as schema from '@/db/schema';
import type { PgTable } from 'drizzle-orm/pg-core';

// Table mapping for dynamic access
const TABLE_MAP: Record<string, PgTable> = {
  leads: schema.leads,
  quotes: schema.quotes,
  orders: schema.orders,
  contracts: schema.contracts,
  payments: schema.payments,
  appointments: schema.appointments,
  measurements: schema.measurements,
  pricing_tiers: schema.pricingTiers,
  sms_consents: schema.smsConsents,
  webhook_events: schema.webhookEvents,
  feedback: schema.feedback,
  dev_tasks: schema.devTasks,
  dev_notes: schema.devNotes,
};

// Tables that can be edited (others are read-only)
const EDITABLE_TABLES = new Set([
  'pricing_tiers',
  'leads',
  'quotes',
  'orders',
  'appointments',
  'feedback',
  'dev_tasks',
  'dev_notes',
]);

interface RouteParams {
  params: Promise<{ table: string }>;
}

/**
 * Check admin authentication
 */
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_session')?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;

  if (!adminToken) return false;
  if (expectedToken && adminToken !== expectedToken) return false;
  return true;
}

/**
 * GET /api/admin/tables/[table]
 * Returns paginated records from the specified table
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table: tableName } = await params;
  const table = TABLE_MAP[tableName];

  if (!table) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(table);
    const totalCount = Number(countResult[0]?.count ?? 0);

    // Get records with pagination
    const records = await db
      .select()
      .from(table)
      .orderBy(desc(sql`created_at`))
      .limit(limit)
      .offset(offset);

    // Get column info from the first record or schema
    const columns = records.length > 0 ? Object.keys(records[0]) : [];

    return NextResponse.json({
      table: tableName,
      records,
      columns,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      editable: EDITABLE_TABLES.has(tableName),
    });
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${tableName}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tables/[table]
 * Update a record in the specified table
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table: tableName } = await params;
  const table = TABLE_MAP[tableName];

  if (!table) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  if (!EDITABLE_TABLES.has(tableName)) {
    return NextResponse.json(
      { error: 'This table is read-only' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
    }

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db
      .update(table)
      .set(updateData)
      .where(eq((table as typeof schema.leads).id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record: result[0] });
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    return NextResponse.json(
      { error: `Failed to update record` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tables/[table]
 * Delete a record from the specified table
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table: tableName } = await params;
  const table = TABLE_MAP[tableName];

  if (!table) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  if (!EDITABLE_TABLES.has(tableName)) {
    return NextResponse.json(
      { error: 'This table is read-only' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
    }

    const result = await db
      .delete(table)
      .where(eq((table as typeof schema.leads).id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    return NextResponse.json(
      { error: `Failed to delete record` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tables/[table]
 * Create a new record in the specified table
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table: tableName } = await params;
  const table = TABLE_MAP[tableName];

  if (!table) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  if (!EDITABLE_TABLES.has(tableName)) {
    return NextResponse.json(
      { error: 'This table is read-only' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Add timestamps
    const insertData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Remove id if present (let DB generate it)
    delete insertData.id;

    const result = await db.insert(table).values(insertData).returning();

    return NextResponse.json({ success: true, record: result[0] }, { status: 201 });
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    return NextResponse.json(
      { error: `Failed to create record` },
      { status: 500 }
    );
  }
}
