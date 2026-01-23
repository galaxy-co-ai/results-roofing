import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import * as schema from '@/db/schema';

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
 * GET /api/admin/tables
 * Returns record counts for all tables
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get counts for each table
    const [
      leadsCount,
      quotesCount,
      ordersCount,
      contractsCount,
      paymentsCount,
      appointmentsCount,
      measurementsCount,
      pricingTiersCount,
      smsConsentsCount,
      webhookEventsCount,
      feedbackCount,
      devTasksCount,
      devNotesCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.leads),
      db.select({ count: sql<number>`count(*)` }).from(schema.quotes),
      db.select({ count: sql<number>`count(*)` }).from(schema.orders),
      db.select({ count: sql<number>`count(*)` }).from(schema.contracts),
      db.select({ count: sql<number>`count(*)` }).from(schema.payments),
      db.select({ count: sql<number>`count(*)` }).from(schema.appointments),
      db.select({ count: sql<number>`count(*)` }).from(schema.measurements),
      db.select({ count: sql<number>`count(*)` }).from(schema.pricingTiers),
      db.select({ count: sql<number>`count(*)` }).from(schema.smsConsents),
      db.select({ count: sql<number>`count(*)` }).from(schema.webhookEvents),
      db.select({ count: sql<number>`count(*)` }).from(schema.feedback),
      db.select({ count: sql<number>`count(*)` }).from(schema.devTasks),
      db.select({ count: sql<number>`count(*)` }).from(schema.devNotes),
    ]);

    return NextResponse.json({
      tables: {
        leads: Number(leadsCount[0]?.count ?? 0),
        quotes: Number(quotesCount[0]?.count ?? 0),
        orders: Number(ordersCount[0]?.count ?? 0),
        contracts: Number(contractsCount[0]?.count ?? 0),
        payments: Number(paymentsCount[0]?.count ?? 0),
        appointments: Number(appointmentsCount[0]?.count ?? 0),
        measurements: Number(measurementsCount[0]?.count ?? 0),
        pricing_tiers: Number(pricingTiersCount[0]?.count ?? 0),
        sms_consents: Number(smsConsentsCount[0]?.count ?? 0),
        webhook_events: Number(webhookEventsCount[0]?.count ?? 0),
        feedback: Number(feedbackCount[0]?.count ?? 0),
        dev_tasks: Number(devTasksCount[0]?.count ?? 0),
        dev_notes: Number(devNotesCount[0]?.count ?? 0),
      },
    });
  } catch (error) {
    console.error('Error fetching table counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}
