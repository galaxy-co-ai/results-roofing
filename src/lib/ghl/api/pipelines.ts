/**
 * GoHighLevel Pipelines & Opportunities API
 * Endpoints for managing sales pipelines and opportunities
 */

import { getGHLClient } from '../client';

export type OpportunityStatus = 'open' | 'won' | 'lost' | 'abandoned';
export type OpportunitySource = 'public_api' | 'ui' | 'webhook' | 'form' | 'workflow' | 'import';

export interface GHLPipeline {
  id: string;
  name: string;
  locationId: string;
  stages: GHLPipelineStage[];
  showInFunnel?: boolean;
  showInPieChart?: boolean;
}

export interface GHLPipelineStage {
  id: string;
  name: string;
  pipelineId: string;
  position?: number;
  showInFunnel?: boolean;
  showInPieChart?: boolean;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: OpportunityStatus;
  source?: OpportunitySource;
  monetaryValue?: number;
  contactId: string;
  locationId: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Array<{
    id: string;
    key?: string;
    fieldValue?: string | string[] | number | boolean;
  }>;
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateOpportunityInput {
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  status?: OpportunityStatus;
  monetaryValue?: number;
  assignedTo?: string;
  customFields?: Array<{
    id: string;
    fieldValue: string | string[] | number | boolean;
  }>;
}

export interface UpdateOpportunityInput {
  id: string;
  name?: string;
  pipelineStageId?: string;
  status?: OpportunityStatus;
  monetaryValue?: number;
  assignedTo?: string;
  customFields?: Array<{
    id: string;
    fieldValue: string | string[] | number | boolean;
  }>;
}

export interface OpportunitySearchParams {
  pipelineId?: string;
  pipelineStageId?: string;
  status?: OpportunityStatus;
  assignedTo?: string;
  contactId?: string;
  startAfter?: string;
  startAfterId?: string;
  limit?: number;
  q?: string;
  getCalendarEvents?: boolean;
  getNotes?: boolean;
  getTasks?: boolean;
}

export interface OpportunitiesListResponse {
  opportunities: GHLOpportunity[];
  meta?: {
    total?: number;
    startAfterId?: string;
    startAfter?: number;
    currentPage?: number;
    nextPage?: number;
    prevPage?: number;
  };
}

export interface PipelinesListResponse {
  pipelines: GHLPipeline[];
}

/**
 * List all pipelines
 */
export async function listPipelines(): Promise<PipelinesListResponse> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.get<PipelinesListResponse>('/opportunities/pipelines', {
    locationId,
  });

  return response.data;
}

/**
 * Get a single pipeline by ID
 */
export async function getPipeline(pipelineId: string): Promise<GHLPipeline> {
  const client = getGHLClient();

  const response = await client.get<{ pipeline: GHLPipeline }>(
    `/opportunities/pipelines/${pipelineId}`
  );
  return response.data.pipeline;
}

/**
 * List opportunities with optional filtering
 */
export async function listOpportunities(
  params: OpportunitySearchParams = {}
): Promise<OpportunitiesListResponse> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.get<OpportunitiesListResponse>('/opportunities/search', {
    locationId,
    pipelineId: params.pipelineId,
    pipelineStageId: params.pipelineStageId,
    status: params.status,
    assigned_to: params.assignedTo,
    contact_id: params.contactId,
    startAfter: params.startAfter,
    startAfterId: params.startAfterId,
    limit: params.limit ?? 20,
    q: params.q,
    getCalendarEvents: params.getCalendarEvents,
    getNotes: params.getNotes,
    getTasks: params.getTasks,
  });

  return response.data;
}

/**
 * Get a single opportunity by ID
 */
export async function getOpportunity(opportunityId: string): Promise<GHLOpportunity> {
  const client = getGHLClient();

  const response = await client.get<{ opportunity: GHLOpportunity }>(
    `/opportunities/${opportunityId}`
  );
  return response.data.opportunity;
}

/**
 * Search opportunities
 */
export async function searchOpportunities(
  query: string,
  params: Omit<OpportunitySearchParams, 'q'> = {}
): Promise<OpportunitiesListResponse> {
  return listOpportunities({ ...params, q: query });
}

/**
 * Create a new opportunity
 */
export async function createOpportunity(
  input: CreateOpportunityInput
): Promise<GHLOpportunity> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.post<{ opportunity: GHLOpportunity }>('/opportunities/', {
    ...input,
    locationId,
    status: input.status ?? 'open',
  });

  return response.data.opportunity;
}

/**
 * Update an existing opportunity
 */
export async function updateOpportunity(
  input: UpdateOpportunityInput
): Promise<GHLOpportunity> {
  const client = getGHLClient();
  const { id, ...data } = input;

  const response = await client.put<{ opportunity: GHLOpportunity }>(
    `/opportunities/${id}`,
    data
  );

  return response.data.opportunity;
}

/**
 * Move opportunity to a different stage
 */
export async function moveOpportunityToStage(
  opportunityId: string,
  stageId: string
): Promise<GHLOpportunity> {
  return updateOpportunity({
    id: opportunityId,
    pipelineStageId: stageId,
  });
}

/**
 * Update opportunity status
 */
export async function updateOpportunityStatus(
  opportunityId: string,
  status: OpportunityStatus
): Promise<GHLOpportunity> {
  return updateOpportunity({
    id: opportunityId,
    status,
  });
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(opportunityId: string): Promise<{ succeded: boolean }> {
  const client = getGHLClient();

  const response = await client.delete<{ succeded: boolean }>(`/opportunities/${opportunityId}`);
  return response.data;
}

/**
 * Get opportunities by contact
 */
export async function getContactOpportunities(
  contactId: string,
  params: Omit<OpportunitySearchParams, 'contactId'> = {}
): Promise<OpportunitiesListResponse> {
  return listOpportunities({ ...params, contactId });
}

/**
 * Get opportunities by pipeline stage
 */
export async function getStageOpportunities(
  pipelineId: string,
  stageId: string,
  params: Omit<OpportunitySearchParams, 'pipelineId' | 'pipelineStageId'> = {}
): Promise<OpportunitiesListResponse> {
  return listOpportunities({ ...params, pipelineId, pipelineStageId: stageId });
}

/**
 * Get pipeline with opportunity counts per stage
 */
export async function getPipelineWithCounts(
  pipelineId: string
): Promise<{
  pipeline: GHLPipeline;
  stageCounts: Record<string, { count: number; value: number }>;
}> {
  const pipeline = await getPipeline(pipelineId);

  // Get counts for each stage
  const stageCounts: Record<string, { count: number; value: number }> = {};

  for (const stage of pipeline.stages) {
    const opportunities = await listOpportunities({
      pipelineId,
      pipelineStageId: stage.id,
      status: 'open',
      limit: 100, // Max for counting
    });

    stageCounts[stage.id] = {
      count: opportunities.meta?.total ?? opportunities.opportunities.length,
      value: opportunities.opportunities.reduce(
        (sum, opp) => sum + (opp.monetaryValue ?? 0),
        0
      ),
    };
  }

  return { pipeline, stageCounts };
}
