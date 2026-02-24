import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { updateAutomation, deleteAutomation } from '@/db/queries/automations';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/automations/[id]
 * Update an automation (commonly used for status toggling)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const automation = await updateAutomation(id, body);
    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json({ automation });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update automation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/automations/[id]
 * Delete an automation
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteAutomation(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete automation' },
      { status: 500 }
    );
  }
}
