import { NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listContacts } from '@/lib/ghl/api/contacts';
import { listConversations } from '@/lib/ghl/api/conversations';
import { listPipelines, listOpportunities } from '@/lib/ghl/api/pipelines';
import { db, schema, rawSql } from '@/db';

interface PipelineStageStat {
  stageId: string;
  stageName: string;
  count: number;
  value: number;
}

interface ActivityDataPoint {
  month: string;
  leads: number;
  jobs: number;
}

interface DashboardStatsResponse {
  contacts: number;
  conversations: number;
  pipelineValue: number;
  pipelineByStage: PipelineStageStat[];
  activityData: ActivityDataPoint[];
  mock: boolean;
}

/**
 * Build monthly activity data for the last 6 months from the DB.
 * - leads: COUNT from leads table grouped by month
 * - jobs: COUNT from orders table where status = 'completed' grouped by month
 */
async function getActivityData(): Promise<ActivityDataPoint[]> {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  try {
    const [leadRows, jobRows] = await Promise.all([
      db.select({
        month: rawSql<string>`TO_CHAR(${schema.leads.createdAt}, 'YYYY-MM')`,
        count: rawSql<number>`COUNT(*)::int`,
      })
        .from(schema.leads)
        .where(rawSql`${schema.leads.createdAt} >= NOW() - INTERVAL '6 months'`)
        .groupBy(rawSql`TO_CHAR(${schema.leads.createdAt}, 'YYYY-MM')`)
        .orderBy(rawSql`TO_CHAR(${schema.leads.createdAt}, 'YYYY-MM')`),

      db.select({
        month: rawSql<string>`TO_CHAR(${schema.orders.createdAt}, 'YYYY-MM')`,
        count: rawSql<number>`COUNT(*)::int`,
      })
        .from(schema.orders)
        .where(rawSql`${schema.orders.status} = 'completed' AND ${schema.orders.createdAt} >= NOW() - INTERVAL '6 months'`)
        .groupBy(rawSql`TO_CHAR(${schema.orders.createdAt}, 'YYYY-MM')`)
        .orderBy(rawSql`TO_CHAR(${schema.orders.createdAt}, 'YYYY-MM')`),
    ]);

    // Build a map for the last 6 months
    const result: ActivityDataPoint[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const leadRow = leadRows.find(r => r.month === key);
      const jobRow = jobRows.find(r => r.month === key);
      result.push({
        month: monthNames[d.getMonth()],
        leads: Number(leadRow?.count) || 0,
        jobs: Number(jobRow?.count) || 0,
      });
    }
    return result;
  } catch (error) {
    console.error('Failed to fetch activity data:', error);
    return [];
  }
}

/**
 * GET /api/ops/dashboard/stats
 * Aggregates contact count, conversation count, pipeline value,
 * opportunity counts by stage, and monthly activity data for the dashboard.
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Always fetch activity data from our DB (not GHL-dependent)
  const activityData = await getActivityData();

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
      activityData: activityData.length > 0 ? activityData : [
        { month: 'Jan', leads: 45, jobs: 12 },
        { month: 'Feb', leads: 52, jobs: 18 },
        { month: 'Mar', leads: 61, jobs: 22 },
        { month: 'Apr', leads: 48, jobs: 15 },
        { month: 'May', leads: 73, jobs: 28 },
        { month: 'Jun', leads: 68, jobs: 24 },
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
      activityData,
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
