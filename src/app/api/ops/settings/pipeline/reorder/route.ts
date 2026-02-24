import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { reorderPipelineStages, listPipelineStages } from '@/db/queries/settings';

/**
 * PUT /api/ops/settings/pipeline/reorder
 * Reorder pipeline stages (bulk position update)
 */
export async function PUT(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    await reorderPipelineStages(body.stages);

    // Return the updated stages list
    const stages = await listPipelineStages();

    return NextResponse.json({ stages });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reorder pipeline stages' },
      { status: 500 }
    );
  }
}
