import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, rawSql } from '@/db';

/**
 * GET /api/ops/analytics
 * Aggregated time-series data for analytics and reports pages.
 * Accepts `from` and `to` query params (YYYY-MM-DD). Defaults to last 30 days.
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const endDate = to || new Date().toISOString().split('T')[0];
  const startDate = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  try {
    // Reusable date expressions
    const paymentDate = rawSql`DATE(COALESCE(${schema.payments.processedAt}, ${schema.payments.createdAt}))`;
    const orderDate = rawSql`DATE(${schema.orders.createdAt})`;
    const quoteDate = rawSql`DATE(${schema.quotes.createdAt})`;

    const [revenueRows, orderRows, quoteRows, pipelineRows, leadSourceRows] = await Promise.all([
      // Daily revenue from succeeded payments
      db.select({
        date: rawSql<string>`${paymentDate}::text`,
        revenue: rawSql<number>`COALESCE(SUM(CASE WHEN ${schema.payments.status} = 'succeeded' THEN ${schema.payments.amount}::numeric ELSE 0 END), 0)::float`,
      })
        .from(schema.payments)
        .where(rawSql`${paymentDate} BETWEEN ${startDate} AND ${endDate}`)
        .groupBy(paymentDate)
        .orderBy(paymentDate),

      // Daily orders
      db.select({
        date: rawSql<string>`${orderDate}::text`,
        count: rawSql<number>`COUNT(*)::int`,
        value: rawSql<number>`COALESCE(SUM(${schema.orders.totalPrice}::numeric), 0)::float`,
      })
        .from(schema.orders)
        .where(rawSql`${orderDate} BETWEEN ${startDate} AND ${endDate}`)
        .groupBy(orderDate)
        .orderBy(orderDate),

      // Daily quotes
      db.select({
        date: rawSql<string>`${quoteDate}::text`,
        count: rawSql<number>`COUNT(*)::int`,
      })
        .from(schema.quotes)
        .where(rawSql`${quoteDate} BETWEEN ${startDate} AND ${endDate}`)
        .groupBy(quoteDate)
        .orderBy(quoteDate),

      // All-time pipeline breakdown by quote status
      db.select({
        stage: schema.quotes.status,
        count: rawSql<number>`COUNT(*)::int`,
        value: rawSql<number>`COALESCE(SUM(${schema.quotes.totalPrice}::numeric), 0)::float`,
      })
        .from(schema.quotes)
        .groupBy(schema.quotes.status),

      // Leads by source (utm_source) within date range
      db.select({
        source: rawSql<string>`COALESCE(${schema.leads.utmSource}, 'direct')`,
        count: rawSql<number>`COUNT(*)::int`,
      })
        .from(schema.leads)
        .where(rawSql`DATE(${schema.leads.createdAt}) BETWEEN ${startDate} AND ${endDate}`)
        .groupBy(rawSql`COALESCE(${schema.leads.utmSource}, 'direct')`)
        .orderBy(rawSql`COUNT(*) DESC`),
    ]);

    // Build date-filled daily array
    const dateMap = new Map<string, { date: string; revenue: number; orders: number; quotes: number }>();
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, { date: key, revenue: 0, orders: 0, quotes: 0 });
    }

    for (const row of revenueRows) {
      const entry = dateMap.get(row.date);
      if (entry) entry.revenue = Number(row.revenue) || 0;
    }
    for (const row of orderRows) {
      const entry = dateMap.get(row.date);
      if (entry) entry.orders = Number(row.count) || 0;
    }
    for (const row of quoteRows) {
      const entry = dateMap.get(row.date);
      if (entry) entry.quotes = Number(row.count) || 0;
    }

    const daily = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Summary totals for the date range
    const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = daily.reduce((s, d) => s + d.orders, 0);
    const totalQuotes = daily.reduce((s, d) => s + d.quotes, 0);

    const summary = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalQuotes,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };

    // Pipeline in funnel order
    const stageOrder = ['preliminary', 'measured', 'selected', 'financed', 'scheduled', 'signed', 'converted'];
    const pipeline = stageOrder.map((stage) => {
      const row = pipelineRows.find((r) => r.stage === stage);
      return {
        stage,
        count: Number(row?.count) || 0,
        value: Math.round((Number(row?.value) || 0) * 100) / 100,
      };
    });

    // Lead sources
    const leadsBySource = leadSourceRows.map(r => ({
      source: String(r.source),
      count: Number(r.count) || 0,
    }));

    return NextResponse.json({ daily, summary, pipeline, leadsBySource });
  } catch (error) {
    console.error('[ops/analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
