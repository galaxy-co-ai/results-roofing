import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import {
  listNotificationPreferences,
  updateNotificationPreference,
} from '@/db/queries/settings';

/**
 * GET /api/ops/settings/notifications
 * List all notification preferences
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferences = await listNotificationPreferences();

  return NextResponse.json({ preferences });
}

/**
 * PUT /api/ops/settings/notifications
 * Update a notification preference by event type
 */
export async function PUT(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const preference = await updateNotificationPreference(body.eventType, {
      emailEnabled: body.emailEnabled,
      smsEnabled: body.smsEnabled,
    });

    if (!preference) {
      return NextResponse.json(
        { error: 'Notification preference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ preference });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update notification preference' },
      { status: 500 }
    );
  }
}
