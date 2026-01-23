import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback, devTasks, devNotes, quotes, leads, orders } from '@/db/schema';
import { count, eq } from 'drizzle-orm';

/**
 * Helper to verify admin authentication
 */
function verifyAdmin(request: NextRequest): boolean {
  const adminToken = request.cookies.get('admin_session')?.value;
  return adminToken === process.env.ADMIN_SESSION_TOKEN;
}

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Feedback stats
    const [feedbackTotal] = await db.select({ count: count() }).from(feedback);
    const [feedbackNew] = await db.select({ count: count() }).from(feedback).where(eq(feedback.status, 'new'));
    const [feedbackInProgress] = await db.select({ count: count() }).from(feedback).where(eq(feedback.status, 'in_progress'));
    const [feedbackResolved] = await db.select({ count: count() }).from(feedback).where(eq(feedback.status, 'resolved'));

    // Task stats
    const [tasksTotal] = await db.select({ count: count() }).from(devTasks);
    const [tasksTodo] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'todo'));
    const [tasksInProgress] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'in_progress'));
    const [tasksDone] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'done'));

    // Notes stats
    const [notesTotal] = await db.select({ count: count() }).from(devNotes);
    const [notesPinned] = await db.select({ count: count() }).from(devNotes).where(eq(devNotes.isPinned, true));

    // Business stats
    const [quotesTotal] = await db.select({ count: count() }).from(quotes);
    const [leadsTotal] = await db.select({ count: count() }).from(leads);
    const [ordersTotal] = await db.select({ count: count() }).from(orders);

    return NextResponse.json({
      feedback: {
        total: feedbackTotal.count,
        new: feedbackNew.count,
        inProgress: feedbackInProgress.count,
        resolved: feedbackResolved.count,
      },
      tasks: {
        total: tasksTotal.count,
        todo: tasksTodo.count,
        inProgress: tasksInProgress.count,
        done: tasksDone.count,
      },
      notes: {
        total: notesTotal.count,
        pinned: notesPinned.count,
      },
      business: {
        quotes: quotesTotal.count,
        leads: leadsTotal.count,
        orders: ordersTotal.count,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
