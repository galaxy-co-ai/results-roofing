import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listAutomations, createAutomation } from '@/db/queries/automations';

/**
 * GET /api/ops/automations
 * List all automations
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const automations = await listAutomations();

  return NextResponse.json({
    automations,
    total: automations.length,
  });
}

/**
 * POST /api/ops/automations
 * Create a new automation
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const automation = await createAutomation({
      name: body.name,
      trigger: body.trigger,
      actions: body.actions,
      status: body.status || 'active',
    });

    return NextResponse.json({ automation });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}
