import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listAutomations, createAutomation } from '@/db/queries/automations';

const createAutomationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  trigger: z.string().min(1, 'Trigger is required'),
  actions: z.string().min(1, 'Actions are required'),
  status: z.enum(['active', 'paused']).default('active'),
});

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
    const validation = createAutomationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const automation = await createAutomation(validation.data);

    return NextResponse.json({ automation });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}
