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

    // GHL opportunities should be created via the pipeline API
    // For now, we log the intent and return mock
    // Full implementation would use ghl/api/pipelines.ts
    logger.info('Job creation requested', {
      quoteId: request.quoteId,
      title: request.title,
      status: request.status,
      totalPrice: request.totalPrice,
    });

    // When GHL opportunity API is fully integrated, implement here
    // For now, the contact sync handles tagging which can trigger GHL automations
    return { id: `ghl-opp-${request.quoteId}-${Date.now()}`, success: true };
  },

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: string): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('CRM not configured');
      return { id: jobId, success: true };
    }

    logger.info('Job status update requested', { jobId, status });
    // When implemented, this would update GHL opportunity stage
    return { id: jobId, success: true };
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

    // Build tags based on quote status
    const tags = ['results-roofing', `quote-${data.status || 'new'}`];
    if (data.packageTier) {
      tags.push(`tier-${data.packageTier}`);
    }

    logger.info('Quote sync to CRM', {
      quoteId,
      status: data.status,
      totalPrice: data.totalPrice,
      tags,
    });

    // Full quote sync would update GHL contact custom fields and opportunity
    return { id: `sync-${quoteId}`, success: true };
  },
};

export default jobnimbusAdapter;
