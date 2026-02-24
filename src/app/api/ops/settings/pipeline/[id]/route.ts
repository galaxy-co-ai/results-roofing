import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { updatePipelineStage, deletePipelineStage } from '@/db/queries/settings';
import { db, schema, eq } from '@/db';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PUT /api/ops/settings/pipeline/[id]
 * Update a pipeline stage
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const stage = await updatePipelineStage(id, body);
    if (!stage) {
      return NextResponse.json({ error: 'Pipeline stage not found' }, { status: 404 });
    }

    return NextResponse.json({ stage });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update pipeline stage' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/settings/pipeline/[id]
 * Delete a pipeline stage (prevents deleting default stages)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if stage is a default stage
    const stage = await db.query.pipelineStages.findFirst({
      where: eq(schema.pipelineStages.id, id),
    });

    if (!stage) {
      return NextResponse.json({ error: 'Pipeline stage not found' }, { status: 404 });
    }

    if (stage.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default stage' },
        { status: 400 }
      );
    }

    await deletePipelineStage(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete pipeline stage' },
      { status: 500 }
    );
  }
}
