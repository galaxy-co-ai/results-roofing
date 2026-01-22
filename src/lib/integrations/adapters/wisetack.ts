/**
 * Wisetack Financing Adapter
 * STUB - Awaiting client Wisetack merchant account
 * 
 * @see https://wisetack.com/docs
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const WISETACK_MERCHANT_ID = process.env.WISETACK_MERCHANT_ID || '';
const WISETACK_API_KEY = process.env.WISETACK_API_KEY || '';

/**
 * Pre-qualification request
 */
export interface PrequalRequest {
  quoteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  loanAmount: number;
  propertyAddress: string;
}

/**
 * Pre-qualification response
 */
export interface PrequalResponse {
  applicationId: string;
  status: 'pending' | 'approved' | 'declined';
  approvedAmount?: number;
  availableTerms?: Array<{
    months: number;
    apr: number;
    monthlyPayment: number;
  }>;
  prequalUrl?: string;
  expiresAt?: string;
}

/**
 * Wisetack Financing Adapter
 */
export const wisetackAdapter = {
  /**
   * Check if Wisetack is configured
   */
  isConfigured(): boolean {
    return !!(WISETACK_MERCHANT_ID && WISETACK_API_KEY);
  },

  /**
   * Generate pre-qualification link
   * STUB - Returns mock data
   */
  async generatePrequalLink(request: PrequalRequest): Promise<PrequalResponse> {
    if (!this.isConfigured()) {
      logger.warn('Wisetack not configured - returning mock prequal');
      return generateMockPrequal(request);
    }

    // TODO: Implement actual Wisetack API call
    logger.warn('Wisetack integration not implemented - returning mock');
    return generateMockPrequal(request);
  },

  /**
   * Check application status
   * STUB - Returns mock data
   */
  async getApplicationStatus(_applicationId: string): Promise<PrequalResponse | null> {
    if (!this.isConfigured()) {
      logger.warn('Wisetack not configured');
      return null;
    }

    // TODO: Implement actual API call
    logger.warn('Wisetack getApplicationStatus not implemented');
    return null;
  },

  /**
   * Get approved terms for an application
   * STUB - Returns mock terms
   */
  async getApprovedTerms(_applicationId: string): Promise<PrequalResponse['availableTerms']> {
    if (!this.isConfigured()) {
      return generateMockTerms();
    }

    // TODO: Implement actual API call
    return generateMockTerms();
  },
};

/**
 * Generate mock pre-qualification for development
 */
function generateMockPrequal(request: PrequalRequest): PrequalResponse {
  return {
    applicationId: `mock-wt-${request.quoteId}-${Date.now()}`,
    status: 'approved',
    approvedAmount: request.loanAmount,
    availableTerms: generateMockTerms(),
    prequalUrl: `https://apply.wisetack.com/mock/${request.quoteId}`,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Generate mock financing terms
 */
function generateMockTerms(): PrequalResponse['availableTerms'] {
  return [
    { months: 12, apr: 0, monthlyPayment: 0 }, // 0% promo
    { months: 24, apr: 9.99, monthlyPayment: 0 },
    { months: 36, apr: 11.99, monthlyPayment: 0 },
    { months: 48, apr: 13.99, monthlyPayment: 0 },
    { months: 60, apr: 15.99, monthlyPayment: 0 },
  ];
}

export default wisetackAdapter;
