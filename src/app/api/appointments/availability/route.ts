import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { calcomAdapter } from '@/lib/integrations/adapters';
import { logger } from '@/lib/utils';

/**
 * GET /api/appointments/availability
 * Get available appointment slots for a date range
 * 
 * Query params:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (required)
 * - timezone: Timezone string (optional, default: America/Chicago)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timezone = searchParams.get('timezone') || 'America/Chicago';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Limit range to 30 days
    const maxDays = 30;
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > maxDays) {
      return NextResponse.json(
        { error: `Date range cannot exceed ${maxDays} days` },
        { status: 400 }
      );
    }

    const slots = await calcomAdapter.getAvailability(startDate, endDate, timezone);

    return NextResponse.json({
      slots,
      timezone,
      startDate,
      endDate,
    });
  } catch (error) {
    logger.error('Error fetching availability', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
