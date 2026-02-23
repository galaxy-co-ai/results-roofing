import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, desc } from '@/db';

/**
 * GET /api/ops/calendar
 * List appointments with optional status/month filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const month = searchParams.get('month') || undefined; // YYYY-MM format

  const allAppointments = await db.query.appointments.findMany({
    with: { order: true },
    orderBy: [desc(schema.appointments.scheduledStart)],
  });

  // Filter in JS for status and month
  let filtered = allAppointments;

  if (status) {
    filtered = filtered.filter((a) => a.status === status);
  }

  if (month) {
    const [year, mon] = month.split('-').map(Number);
    filtered = filtered.filter((a) => {
      const d = new Date(a.scheduledStart);
      return d.getFullYear() === year && d.getMonth() + 1 === mon;
    });
  }

  // Map to API shape
  const appointments = filtered.map((a) => ({
    id: a.id,
    orderId: a.orderId,
    type: a.type,
    scheduledStart: a.scheduledStart.toISOString(),
    scheduledEnd: a.scheduledEnd.toISOString(),
    attendeeName: a.attendeeName || a.order?.customerName || null,
    attendeeEmail: a.attendeeEmail || a.order?.customerEmail || null,
    status: a.status,
    address: a.order?.propertyAddress || null,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
  }));

  return NextResponse.json({ appointments, total: appointments.length });
}
