import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import {
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '@/lib/ghl';

const updateOpportunitySchema = z.object({
  name: z.string().min(1).optional(),
  pipelineStageId: z.string().min(1).optional(),
  status: z.enum(['open', 'won', 'lost', 'abandoned']).optional(),
  monetaryValue: z.number().optional(),
  assignedTo: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ops/opportunities/[id]
 * Get a single opportunity
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({
      opportunity: {
        id,
        name: 'Mock Opportunity',
        pipelineId: 'pipeline-1',
        pipelineStageId: 'stage-1',
        status: 'open',
        monetaryValue: 10000,
        contactId: 'mock-1',
        locationId: 'mock-location',
      },
      mock: true,
    });
  }

  try {
    const opportunity = await getOpportunity(id);
    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Failed to fetch opportunity:', error);
    return NextResponse.json(
      { error: 'Opportunity not found' },
      { status: 404 }
    );
  }
}

/**
 * PATCH /api/ops/opportunities/[id]
 * Update an opportunity (used for moving between stages)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    // Return mock success for development
    const body = await request.json();
    return NextResponse.json({
      opportunity: {
        id,
        ...body,
      },
      mock: true,
    });
  }

  try {
    const body = await request.json();
    const validated = updateOpportunitySchema.parse(body);

    const opportunity = await updateOpportunity({ id, ...validated });
    return NextResponse.json({ opportunity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to update opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/opportunities/[id]
 * Delete an opportunity
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 });
  }

  try {
    await deleteOpportunity(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}
