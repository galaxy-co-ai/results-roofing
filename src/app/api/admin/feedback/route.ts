import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, desc, eq } from '@/db';
import { feedback, type NewFeedback } from '@/db/schema';

/**
 * POST /api/admin/feedback
 * Create new feedback entry (called from feedback widget)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const schema = z.object({
      reason: z.enum(['bug', 'suggestion', 'general']),
      subOption: z.string().min(1),
      customReason: z.string().optional(),
      notes: z.string().optional(),
      page: z.string().min(1),
      userAgent: z.string().optional(),
      timestamp: z.string().datetime(),
    });

    const validated = schema.parse(body);

    const newFeedback: NewFeedback = {
      reason: validated.reason,
      subOption: validated.subOption,
      customReason: validated.customReason || null,
      notes: validated.notes || null,
      page: validated.page,
      userAgent: validated.userAgent || null,
      feedbackTimestamp: new Date(validated.timestamp),
      status: 'new',
    };

    const [created] = await db.insert(feedback).values(newFeedback).returning();

    return NextResponse.json({ success: true, feedback: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/feedback
 * List all feedback entries with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get('admin_session')?.value;
    const expectedToken = process.env.ADMIN_SESSION_TOKEN;
    if (!adminToken || (expectedToken && adminToken !== expectedToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query = db.select().from(feedback);

    // Apply filters if provided
    const conditions = [];
    if (status && ['new', 'reviewed', 'in_progress', 'resolved', 'wont_fix'].includes(status)) {
      conditions.push(eq(feedback.status, status as typeof feedback.status.enumValues[number]));
    }
    if (reason && ['bug', 'suggestion', 'general'].includes(reason)) {
      conditions.push(eq(feedback.reason, reason as typeof feedback.reason.enumValues[number]));
    }

    const results = await query
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(desc(feedback.createdAt))
      .limit(limit);

    return NextResponse.json({ feedback: results });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
