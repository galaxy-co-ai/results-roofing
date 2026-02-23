import { NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listContacts } from '@/lib/ghl/api/contacts';
import { listConversations } from '@/lib/ghl/api/conversations';
import { listPipelines, listOpportunities } from '@/lib/ghl/api/pipelines';

interface PipelineStageStat {
  stageId: string;
  stageName: string;
  count: number;
  value: number;
}

interface DashboardStatsResponse {
  contacts: number;
  conversations: number;
  pipelineValue: number;
  pipelineByStage: PipelineStageStat[];
  mock: boolean;
}

/**
 * GET /api/ops/dashboard/stats
 * Aggregates contact count, conversation count, pipeline value,
 * and opportunity counts by stage for the dashboard.
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ghlConfigured = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

  if (!ghlConfigured) {
    return NextResponse.json<DashboardStatsResponse>({
      contacts: 5,
      conversations: 8,
      pipelineValue: 48700,
      pipelineByStage: [
        { stageId: 'stage-1', stageName: 'New Lead', count: 1, value: 18000 },
        { stageId: 'stage-2', stageName: 'Contacted', count: 2, value: 9700 },
        { stageId: 'stage-3', stageName: 'Quote Sent', count: 1, value: 12500 },
        { stageId: 'stage-4', stageName: 'Negotiation', count: 1, value: 8500 },
        { stageId: 'stage-5', stageName: 'Won', count: 0, value: 0 },
      ],
      mock: true,
    });
  }

  try {
    // Fetch all sources concurrently
    const [contactsResult, conversationsResult, pipelinesResult, oppsResult] =
      await Promise.all([
        listContacts({ limit: 1 }).catch(() => null),
        listConversations({ limit: 1 }).catch(() => null),
        listPipelines().catch(() => null),
        listOpportunities({ status: 'open', limit: 100 }).catch(() => null),
      ]);

    // Extract counts
    const contacts = contactsResult?.meta?.total ?? 0;
    const conversations = conversationsResult?.total ?? 0;

    // Build stage map from pipeline
    const pipeline = pipelinesResult?.pipelines?.[0];
    const stages = (pipeline?.stages || []) as Array<{
      id: string;
      name: string;
      position: number;
    }>;
    const opportunities = (oppsResult?.opportunities || []) as Array<{
      pipelineStageId: string;
      monetaryValue?: number;
    }>;

    // Aggregate pipeline value + by-stage breakdown
    let pipelineValue = 0;
    const stageMap = new Map<string, PipelineStageStat>();

    for (const stage of stages) {
      stageMap.set(stage.id, {
        stageId: stage.id,
        stageName: stage.name,
        count: 0,
        value: 0,
      });
    }

    for (const opp of opportunities) {
      const val = opp.monetaryValue || 0;
      pipelineValue += val;
      const stat = stageMap.get(opp.pipelineStageId);
      if (stat) {
        stat.count += 1;
        stat.value += val;
      }
    }

    const pipelineByStage = Array.from(stageMap.values()).sort(
      (a, b) => {
        const aIdx = stages.findIndex((s) => s.id === a.stageId);
        const bIdx = stages.findIndex((s) => s.id === b.stageId);
        return aIdx - bIdx;
      }
    );

    return NextResponse.json<DashboardStatsResponse>({
      contacts,
      conversations,
      pipelineValue,
      pipelineByStage,
      mock: false,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
