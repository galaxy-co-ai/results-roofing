/**
 * JobNimbus CRM Adapter
 * STUB - Awaiting client JobNimbus API access
 * 
 * @see https://support.jobnimbus.com/how-do-i-create-an-integration-using-jobnimbuss-open-api
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const JOBNIMBUS_API_KEY = process.env.JOBNIMBUS_API_KEY || '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _JOBNIMBUS_API_URL = 'https://app.jobnimbus.com/api1';

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
}

/**
 * JobNimbus CRM Adapter
 */
export const jobnimbusAdapter = {
  /**
   * Check if JobNimbus is configured
   */
  isConfigured(): boolean {
    return !!JOBNIMBUS_API_KEY;
  },

  /**
   * Create a contact in JobNimbus
   * STUB - Returns mock data
   */
  async createContact(_request: CreateContactRequest): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('JobNimbus not configured - returning mock contact');
      return { id: `mock-contact-${Date.now()}`, success: true };
    }

    // TODO: Implement actual JobNimbus API call
    logger.warn('JobNimbus integration not implemented');
    return { id: `mock-contact-${Date.now()}`, success: true };
  },

  /**
   * Create a job in JobNimbus
   * STUB - Returns mock data
   */
  async createJob(_request: CreateJobRequest): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('JobNimbus not configured - returning mock job');
      return { id: `mock-job-${Date.now()}`, success: true };
    }

    // TODO: Implement actual API call
    logger.warn('JobNimbus createJob not implemented');
    return { id: `mock-job-${Date.now()}`, success: true };
  },

  /**
   * Update job status
   * STUB - Returns success
   */
  async updateJobStatus(jobId: string, _status: string): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('JobNimbus not configured');
      return { id: jobId, success: true };
    }

    // TODO: Implement actual API call
    logger.warn('JobNimbus updateJobStatus not implemented');
    return { id: jobId, success: true };
  },

  /**
   * Sync quote to CRM
   * STUB - Returns mock data
   */
  async syncQuote(quoteId: string, _data: Partial<CreateJobRequest>): Promise<CrmResponse> {
    if (!this.isConfigured()) {
      logger.warn('JobNimbus not configured - quote sync skipped');
      return { id: `mock-sync-${quoteId}`, success: true };
    }

    // TODO: Implement actual sync logic
    logger.warn('JobNimbus syncQuote not implemented');
    return { id: `mock-sync-${quoteId}`, success: true };
  },
};

export default jobnimbusAdapter;
