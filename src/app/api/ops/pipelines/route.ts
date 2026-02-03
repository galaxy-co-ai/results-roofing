import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import {
  listPipelines,
  listOpportunities,
  createOpportunity,
  getPipelineWithCounts,
} from '@/lib/ghl';

const createOpportunitySchema = z.object({
  name: z.string().min(1),
  pipelineId: z.string().min(1),
  pipelineStageId: z.string().min(1),
  contactId: z.string().min(1),
  status: z.enum(['open', 'won', 'lost', 'abandoned']).optional(),
  monetaryValue: z.number().optional(),
  assignedTo: z.string().optional(),
});

/**
 * GET /api/ops/pipelines
 * List pipelines and optionally opportunities
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get('pipelineId');
  const stageId = searchParams.get('stageId');
  const includeOpportunities = searchParams.get('opportunities') === 'true';
  const includeCounts = searchParams.get('counts') === 'true';

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    // Return mock data if GHL not configured
    return NextResponse.json({
      pipelines: getMockPipelines(),
      opportunities: includeOpportunities ? getMockOpportunities() : undefined,
      mock: true,
    });
  }

  try {
    // If requesting a specific pipeline with counts
    if (pipelineId && includeCounts) {
      const result = await getPipelineWithCounts(pipelineId);
      return NextResponse.json(result);
    }

    // Get pipelines
    const pipelinesResult = await listPipelines();

    // Optionally get opportunities
    let opportunities;
    if (includeOpportunities) {
      const oppResult = await listOpportunities({
        pipelineId: pipelineId || undefined,
        pipelineStageId: stageId || undefined,
        status: 'open',
        limit: 100,
      });
      opportunities = oppResult.opportunities;
    }

    return NextResponse.json({
      pipelines: pipelinesResult.pipelines,
      opportunities,
    });
  } catch (error) {
    console.error('Failed to fetch pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipelines' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/pipelines
 * Create a new opportunity
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if GHL is configured
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const validated = createOpportunitySchema.parse(body);

    const opportunity = await createOpportunity(validated);
    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to create opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockPipelines() {
  return [
    {
      id: 'pipeline-1',
      name: 'Sales Pipeline',
      locationId: 'mock-location',
      stages: [
        { id: 'stage-1', name: 'New Lead', pipelineId: 'pipeline-1', position: 0 },
        { id: 'stage-2', name: 'Contacted', pipelineId: 'pipeline-1', position: 1 },
        { id: 'stage-3', name: 'Quote Sent', pipelineId: 'pipeline-1', position: 2 },
        { id: 'stage-4', name: 'Negotiation', pipelineId: 'pipeline-1', position: 3 },
        { id: 'stage-5', name: 'Won', pipelineId: 'pipeline-1', position: 4 },
      ],
    },
  ];
}

function getMockOpportunities() {
  return [
    {
      id: 'opp-1',
      name: 'Smith Roof Replacement',
      pipelineId: 'pipeline-1',
      pipelineStageId: 'stage-3',
      status: 'open',
      monetaryValue: 12500,
      contactId: 'mock-1',
      locationId: 'mock-location',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      contact: {
        id: 'mock-1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
      },
    },
    {
      id: 'opp-2',
      name: 'Johnson Repair',
      pipelineId: 'pipeline-1',
      pipelineStageId: 'stage-2',
      status: 'open',
      monetaryValue: 3500,
      contactId: 'mock-2',
      locationId: 'mock-location',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      contact: {
        id: 'mock-2',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 234-5678',
      },
    },
    {
      id: 'opp-3',
      name: 'Brown Full Replacement',
      pipelineId: 'pipeline-1',
      pipelineStageId: 'stage-1',
      status: 'open',
      monetaryValue: 18000,
      contactId: 'mock-3',
      locationId: 'mock-location',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      contact: {
        id: 'mock-3',
        name: 'Mike Brown',
        email: 'mike.brown@example.com',
        phone: '+1 (555) 345-6789',
      },
    },
    {
      id: 'opp-4',
      name: 'Davis Maintenance',
      pipelineId: 'pipeline-1',
      pipelineStageId: 'stage-4',
      status: 'open',
      monetaryValue: 8500,
      contactId: 'mock-4',
      locationId: 'mock-location',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      contact: {
        id: 'mock-4',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1 (555) 456-7890',
      },
    },
    {
      id: 'opp-5',
      name: 'Wilson Storm Damage',
      pipelineId: 'pipeline-1',
      pipelineStageId: 'stage-2',
      status: 'open',
      monetaryValue: 6200,
      contactId: 'mock-5',
      locationId: 'mock-location',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      contact: {
        id: 'mock-5',
        name: 'David Wilson',
        email: 'david.w@example.com',
        phone: '+1 (555) 567-8901',
      },
    },
  ];
}
