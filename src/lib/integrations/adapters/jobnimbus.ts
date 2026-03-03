/**
 * JobNimbus CRM Adapter
 *
 * MIGRATION NOTE (2026-02-03):
 * Migrated to GoHighLevel (GHL) as primary CRM.
 * This adapter now wraps GHL functions for backward compatibility.
 *
 * Legacy JobNimbus API docs:
 * @see https://support.jobnimbus.com/how-do-i-create-an-integration-using-jobnimbuss-open-api
 *
 * GHL API docs:
 * @see https://highlevel.stoplight.io/docs/integrations
 */

import { logger } from '@/lib/utils';
import { ghlMessagingAdapter } from './ghl-messaging';
import {
  createOpportunity,
  updateOpportunity,
  moveOpportunityToStage,
} from '@/lib/ghl/api/pipelines';

// Check if legacy JobNimbus is still configured
const JOBNIMBUS_API_KEY = process.env.JOBNIMBUS_API_KEY || '';

/**
 * Contact to create in CRM
 */
export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Job to create in CRM
 */
export interface CreateJobRequest {
  contactId: string;
  quoteId: string;
  title: string;
  status: string;
  packageTier: string;
  totalPrice: number;
  depositAmount: number;
  scheduledDate?: string;
}

/**
 * CRM response
 */
export interface CrmResponse {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * JobNimbus CRM Adapter
 * Now wraps GHL CRM for unified contact management
 */
export const jobnimbusAdapter = {
  /**
   * Check if CRM is configured
   * Returns true if either legacy JobNimbus or GHL is configured
   */
  isConfigured(): boolean {
    return !!JOBNIMBUS_API_KEY || ghlMessagingAdapter.isConfigured();
  },

  /**
   * Create a contact in CRM
   * Uses GHL CRM if configured, falls back to mock
   */
  async createContact(request: CreateContactRequest): Promise<CrmResponse> {
    // Use GHL if configured
    if (ghlMessagingAdapter.isConfigured()) {
      try {
        const result = await ghlMessagingAdapter.syncCustomerToCRM({
          email: request.email,
          phone: request.phone,
          firstName: request.firstName,
          lastName: request.lastName,
          address: request.address,
          city: request.city,
          state: request.state,
          postalCode: request.zip,
          tags: ['results-roofing', request.source || 'website'],
          source: request.source || 'results-roofing-app',
        });

        return {
          id: result.contactId,
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('GHL contact creation failed', { error: errorMessage });
        return { id: '', success: false, error: errorMessage };
      }
    }

    // Legacy JobNimbus (if configured separately)
    if (JOBNIMBUS_API_KEY) {
      logger.warn('Legacy JobNimbus API configured but not implemented - migrate to GHL');
      return { id: `mock-contact-${Date.now()}`, success: true };
    }

    // Mock response for dev
    logger.warn('CRM not configured - returning mock contact');
    return { id: `mock-contact-${Date.now()}`, success: true };
  },

  /**
   * Create a job in CRM
   * Note: GHL uses "Opportunities" for this concept
   */
  async createJob(request: CreateJobRequest): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('CRM not configured - returning mock job');
      return { id: `mock-job-${Date.now()}`, success: true };
    }

    const pipelineId = process.env.GHL_PIPELINE_ID;
    const stageId = process.env.GHL_QUOTE_STAGE_ID;

    if (!pipelineId || !stageId) {
      logger.warn('GHL pipeline/stage IDs not configured, skipping job creation');
      return { id: `mock-job-${Date.now()}`, success: true };
    }

    try {
      const opp = await createOpportunity({
        name: request.title,
        pipelineId,
        pipelineStageId: stageId,
        contactId: request.contactId,
        status: 'open',
        monetaryValue: request.totalPrice,
      });

      logger.info('GHL opportunity created', {
        opportunityId: opp.id,
        quoteId: request.quoteId,
        totalPrice: request.totalPrice,
      });

      return { id: opp.id, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('GHL opportunity creation failed', { error: errorMessage });
      return { id: '', success: false, error: errorMessage };
    }
  },

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: string): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('CRM not configured');
      return { id: jobId, success: true };
    }

    // Map status strings to GHL stage env vars
    const stageEnvMap: Record<string, string> = {
      quote: 'GHL_QUOTE_STAGE_ID',
      scheduled: 'GHL_SCHEDULED_STAGE_ID',
      in_progress: 'GHL_IN_PROGRESS_STAGE_ID',
      completed: 'GHL_COMPLETED_STAGE_ID',
      cancelled: 'GHL_CANCELLED_STAGE_ID',
    };

    const envKey = stageEnvMap[status];
    const stageId = envKey ? process.env[envKey] : undefined;

    if (!stageId) {
      logger.warn('No GHL stage ID mapped for status, skipping move', { status, envKey });
      return { id: jobId, success: true };
    }

    try {
      const opp = await moveOpportunityToStage(jobId, stageId);
      logger.info('GHL opportunity moved to stage', {
        opportunityId: opp.id,
        status,
        stageId,
      });
      return { id: opp.id, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('GHL opportunity stage move failed', { error: errorMessage, jobId, status });
      return { id: jobId, success: false, error: errorMessage };
    }
  },

  /**
   * Sync quote to CRM
   * Creates/updates contact with quote-related tags
   */
  async syncQuote(quoteId: string, data: Partial<CreateJobRequest>): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('CRM not configured - quote sync skipped');
      return { id: `mock-sync-${quoteId}`, success: true };
    }

    // If we have an opportunity ID (quoteId maps to it), update monetary value
    // The quoteId here is expected to be the GHL opportunity ID when syncing
    try {
      const opp = await updateOpportunity({
        id: quoteId,
        ...(data.totalPrice !== undefined && { monetaryValue: data.totalPrice }),
        ...(data.status && {
          status: data.status === 'cancelled' || data.status === 'lost'
            ? 'lost' as const
            : data.status === 'completed' || data.status === 'won'
              ? 'won' as const
              : 'open' as const,
        }),
      });

      logger.info('GHL opportunity synced with quote data', {
        opportunityId: opp.id,
        quoteId,
        totalPrice: data.totalPrice,
        status: data.status,
      });

      return { id: opp.id, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('GHL quote sync failed', { error: errorMessage, quoteId });
      return { id: quoteId, success: false, error: errorMessage };
    }
  },
};

export default jobnimbusAdapter;
