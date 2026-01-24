import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback, devTasks, devNotes, quotes, leads, orders } from '@/db/schema';
import { count, eq, gte, sql } from 'drizzle-orm';

/**
 * Helper to verify admin authentication
 */
function verifyAdmin(request: NextRequest): boolean {
  const adminToken = request.cookies.get('admin_session')?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  
  // In development, allow if token exists and matches expected (or no expected token set)
  if (!expectedToken) {
    // If no ADMIN_SESSION_TOKEN env var, just check cookie exists
    return !!adminToken;
  }
  
  return adminToken === expectedToken;
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get date N days ago at midnight
 */
function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate array of dates for the last N days
 */
function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(formatDate(getDaysAgo(i)));
  }
  return dates;
}

/**
 * GET /api/admin/stats
 * Get enhanced dashboard statistics with trends and time-series data
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sevenDaysAgo = getDaysAgo(7);
    const fourteenDaysAgo = getDaysAgo(14);
    // thirtyDaysAgo reserved for future 30-day trend analytics

    // ========================================
    // FEEDBACK STATS
    // ========================================
    const [feedbackTotal] = await db.select({ count: count() }).from(feedback);
    const [feedbackNew] = await db.select({ count: count() }).from(feedback).where(eq(feedback.status, 'new'));
    const [feedbackInProgress] = await db.select({ count: count() }).from(feedback).where(eq(feedback.status, 'in_progress'));
    const [feedbackResolved] = await db.select({ count: count() }).from(feedback).where(eq(feedback.status, 'resolved'));

    // Feedback by reason for chart
    const feedbackByReason = await db
      .select({ reason: feedback.reason, count: count() })
      .from(feedback)
      .groupBy(feedback.reason);

    // ========================================
    // TASK STATS
    // ========================================
    const [tasksTotal] = await db.select({ count: count() }).from(devTasks);
    const [tasksTodo] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'todo'));
    const [tasksInProgress] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'in_progress'));
    const [tasksDone] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'done'));
    const [tasksBacklog] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'backlog'));
    const [tasksReview] = await db.select({ count: count() }).from(devTasks).where(eq(devTasks.status, 'review'));

    // Tasks by priority
    const tasksByPriority = await db
      .select({ priority: devTasks.priority, count: count() })
      .from(devTasks)
      .groupBy(devTasks.priority);

    // Tasks by category
    const tasksByCategory = await db
      .select({ category: devTasks.category, count: count() })
      .from(devTasks)
      .groupBy(devTasks.category);

    // ========================================
    // NOTES STATS
    // ========================================
    const [notesTotal] = await db.select({ count: count() }).from(devNotes);
    const [notesPinned] = await db.select({ count: count() }).from(devNotes).where(eq(devNotes.isPinned, true));

    // ========================================
    // BUSINESS STATS WITH TRENDS
    // ========================================
    
    // Current period (last 7 days)
    const [quotesLast7Days] = await db
      .select({ count: count() })
      .from(quotes)
      .where(gte(quotes.createdAt, sevenDaysAgo));
    
    const [leadsLast7Days] = await db
      .select({ count: count() })
      .from(leads)
      .where(gte(leads.createdAt, sevenDaysAgo));
    
    const [ordersLast7Days] = await db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo));

    // Previous period (7-14 days ago)
    const [quotesPrevious7Days] = await db
      .select({ count: count() })
      .from(quotes)
      .where(sql`${quotes.createdAt} >= ${fourteenDaysAgo} AND ${quotes.createdAt} < ${sevenDaysAgo}`);
    
    const [leadsPrevious7Days] = await db
      .select({ count: count() })
      .from(leads)
      .where(sql`${leads.createdAt} >= ${fourteenDaysAgo} AND ${leads.createdAt} < ${sevenDaysAgo}`);
    
    const [ordersPrevious7Days] = await db
      .select({ count: count() })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${fourteenDaysAgo} AND ${orders.createdAt} < ${sevenDaysAgo}`);

    // Totals
    const [quotesTotal] = await db.select({ count: count() }).from(quotes);
    const [leadsTotal] = await db.select({ count: count() }).from(leads);
    const [ordersTotal] = await db.select({ count: count() }).from(orders);

    // Quote status distribution
    const quotesByStatus = await db
      .select({ status: quotes.status, count: count() })
      .from(quotes)
      .groupBy(quotes.status);

    // ========================================
    // TIME-SERIES DATA (Last 7 days)
    // ========================================
    const dateRange = getDateRange(7);
    
    // Get quotes per day
    const quotesPerDay = await db
      .select({
        date: sql<string>`DATE(${quotes.createdAt})::text`,
        count: count(),
      })
      .from(quotes)
      .where(gte(quotes.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${quotes.createdAt})`);

    // Get feedback per day
    const feedbackPerDay = await db
      .select({
        date: sql<string>`DATE(${feedback.createdAt})::text`,
        count: count(),
      })
      .from(feedback)
      .where(gte(feedback.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${feedback.createdAt})`);

    // Get tasks completed per day
    const tasksCompletedPerDay = await db
      .select({
        date: sql<string>`DATE(${devTasks.completedAt})::text`,
        count: count(),
      })
      .from(devTasks)
      .where(gte(devTasks.completedAt, sevenDaysAgo))
      .groupBy(sql`DATE(${devTasks.completedAt})`);

    // Build weekly activity data with all dates filled in
    const weeklyActivity = dateRange.map(date => {
      const quotesForDate = quotesPerDay.find(q => q.date === date);
      const feedbackForDate = feedbackPerDay.find(f => f.date === date);
      const tasksForDate = tasksCompletedPerDay.find(t => t.date === date);

      return {
        date,
        quotes: quotesForDate?.count ?? 0,
        feedback: feedbackForDate?.count ?? 0,
        tasksCompleted: tasksForDate?.count ?? 0,
      };
    });

    // Build quote trend sparkline data
    const quotesTrend = dateRange.map(date => {
      const quotesForDate = quotesPerDay.find(q => q.date === date);
      return {
        date,
        count: quotesForDate?.count ?? 0,
      };
    });

    return NextResponse.json({
      // Existing stats structure
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
        backlog: tasksBacklog.count,
        review: tasksReview.count,
        completionRate: tasksTotal.count > 0 
          ? Math.round((tasksDone.count / tasksTotal.count) * 100) 
          : 0,
      },
      notes: {
        total: notesTotal.count,
        pinned: notesPinned.count,
      },
      business: {
        quotes: quotesTotal.count,
        quotesLast7Days: quotesLast7Days.count,
        quotesChange: calculatePercentChange(quotesLast7Days.count, quotesPrevious7Days.count),
        leads: leadsTotal.count,
        leadsLast7Days: leadsLast7Days.count,
        leadsChange: calculatePercentChange(leadsLast7Days.count, leadsPrevious7Days.count),
        orders: ordersTotal.count,
        ordersLast7Days: ordersLast7Days.count,
        ordersChange: calculatePercentChange(ordersLast7Days.count, ordersPrevious7Days.count),
      },
      // New chart data
      chartData: {
        weeklyActivity,
        quotesTrend,
        quotesByStatus: quotesByStatus.map(s => ({
          status: s.status || 'unknown',
          count: s.count,
        })),
        feedbackByReason: feedbackByReason.map(r => ({
          reason: r.reason || 'general',
          count: r.count,
        })),
        tasksByPriority: tasksByPriority.map(p => ({
          priority: p.priority || 'medium',
          count: p.count,
        })),
        tasksByCategory: tasksByCategory.map(c => ({
          category: c.category || 'feature',
          count: c.count,
        })),
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
