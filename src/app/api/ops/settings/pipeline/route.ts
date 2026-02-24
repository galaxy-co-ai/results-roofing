import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listPipelineStages, createPipelineStage } from '@/db/queries/settings';

/**
 * GET /api/ops/settings/pipeline
 * List all pipeline stages
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stages = await listPipelineStages();

  return NextResponse.json({ stages });
}

/**
 * POST /api/ops/settings/pipeline
 * Create a new pipeline stage
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const stage = await createPipelineStage({
      name: body.name,
      position: body.position,
      color: body.color || null,
    });

    return NextResponse.json({ stage });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create pipeline stage' },
      { status: 500 }
    );
  }
}
