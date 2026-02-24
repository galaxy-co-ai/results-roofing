import { NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, desc } from '@/db';

/**
 * GET /api/ops/settings/export
 * Export contacts, orders, quotes, and payments as CSV
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all data in parallel
    const [leads, quotes, orders, payments] = await Promise.all([
      db.query.leads.findMany({
        orderBy: [desc(schema.leads.createdAt)],
      }),
      db.query.quotes.findMany({
        orderBy: [desc(schema.quotes.createdAt)],
      }),
      db.query.orders.findMany({
        orderBy: [desc(schema.orders.createdAt)],
      }),
      db.query.payments.findMany({
        orderBy: [desc(schema.payments.createdAt)],
      }),
    ]);

    // Build CSV sections
    const sections: string[] = [];

    // --- Contacts ---
    sections.push('=== CONTACTS ===');
    sections.push('id,email,phone,first_name,last_name,address,city,state,zip,created_at');
    for (const lead of leads) {
      sections.push(
        [
          lead.id,
          csvEscape(lead.email),
          csvEscape(lead.phone),
          csvEscape(lead.firstName),
          csvEscape(lead.lastName),
          csvEscape(lead.address),
          csvEscape(lead.city),
          csvEscape(lead.state),
          csvEscape(lead.zip),
          lead.createdAt.toISOString(),
        ].join(',')
      );
    }

    // --- Quotes ---
    sections.push('');
    sections.push('=== QUOTES ===');
    sections.push('id,lead_id,status,address,city,state,zip,selected_tier,total_price,created_at');
    for (const quote of quotes) {
      sections.push(
        [
          quote.id,
          quote.leadId || '',
          quote.status,
          csvEscape(quote.address),
          csvEscape(quote.city),
          csvEscape(quote.state),
          csvEscape(quote.zip),
          quote.selectedTier || '',
          quote.totalPrice || '',
          quote.createdAt.toISOString(),
        ].join(',')
      );
    }

    // --- Orders ---
    sections.push('');
    sections.push('=== ORDERS ===');
    sections.push('id,confirmation_number,status,customer_name,customer_email,property_address,selected_tier,total_price,created_at');
    for (const order of orders) {
      sections.push(
        [
          order.id,
          order.confirmationNumber,
          order.status,
          csvEscape(order.customerName),
          csvEscape(order.customerEmail),
          csvEscape(order.propertyAddress),
          order.selectedTier,
          order.totalPrice,
          order.createdAt.toISOString(),
        ].join(',')
      );
    }

    // --- Payments ---
    sections.push('');
    sections.push('=== PAYMENTS ===');
    sections.push('id,order_id,type,amount,currency,status,processed_at,created_at');
    for (const payment of payments) {
      sections.push(
        [
          payment.id,
          payment.orderId,
          payment.type,
          payment.amount,
          payment.currency,
          payment.status,
          payment.processedAt?.toISOString() || '',
          payment.createdAt.toISOString(),
        ].join(',')
      );
    }

    const csv = sections.join('\n');
    const today = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=results-roofing-export-${today}.csv`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

/** Escape a CSV field — wrap in quotes if it contains commas, quotes, or newlines */
function csvEscape(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
