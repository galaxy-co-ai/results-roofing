/**
 * Roofr Measurement Adapter
 * STUB - Awaiting client Roofr API credentials
 * 
 * @see https://roofr.com/measurements
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const ROOFR_API_KEY = process.env.ROOFR_API_KEY || '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ROOFR_API_URL = process.env.ROOFR_API_URL || 'https://api.roofr.com/v1';

/**
 * Measurement request
 */
export interface MeasurementRequest {
  address: string;
  city: string;
  state: string;
  zip: string;
  callbackUrl?: string;
  metadata?: {
    quoteId?: string;
    leadId?: string;
  };
}

/**
 * Measurement report
 */
export interface MeasurementReport {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  address: string;
  sqftTotal?: number;
  facets?: Array<{
    id: string;
    sqft: number;
    pitch: number;
    orientation: string;
  }>;
  pitchPrimary?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  reportPdfUrl?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Roofr Measurement Adapter
 */
export const roofrAdapter = {
  /**
   * Check if Roofr is configured
   */
  isConfigured(): boolean {
    return !!ROOFR_API_KEY;
  },

  /**
   * Request a new roof measurement
   * STUB - Returns mock data
   */
  async requestMeasurement(request: MeasurementRequest): Promise<MeasurementReport> {
    if (!this.isConfigured()) {
      logger.warn('Roofr not configured - returning mock measurement');
      return generateMockMeasurement(request);
    }

    // TODO: Implement actual Roofr API call
    // const response = await fetch(`${ROOFR_API_URL}/measurements`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${ROOFR_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(request),
    // });

    logger.warn('Roofr integration not implemented - returning mock');
    return generateMockMeasurement(request);
  },

  /**
   * Get measurement status/report
   * STUB - Returns mock data
   */
  async getMeasurement(_measurementId: string): Promise<MeasurementReport | null> {
    if (!this.isConfigured()) {
      logger.warn('Roofr not configured');
      return null;
    }

    // TODO: Implement actual API call
    logger.warn('Roofr getMeasurement not implemented');
    return null;
  },

  /**
   * Poll for measurement completion
   * STUB - Returns completed mock immediately
   */
  async pollUntilComplete(
    measurementId: string,
    _maxAttempts: number = 10,
    _intervalMs: number = 5000
  ): Promise<MeasurementReport | null> {
    if (!this.isConfigured()) {
      // Return mock "completed" measurement
      return {
        id: measurementId,
        status: 'completed',
        address: 'Mock Address',
        sqftTotal: 2500,
        pitchPrimary: 6,
        complexity: 'moderate',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    // TODO: Implement actual polling logic
    return null;
  },
};

/**
 * Generate mock measurement for development
 */
function generateMockMeasurement(request: MeasurementRequest): MeasurementReport {
  const fullAddress = `${request.address}, ${request.city}, ${request.state} ${request.zip}`;
  
  // Generate realistic random values based on state
  const baseSquFt: Record<string, number> = {
    TX: 2800,
    GA: 2600,
    NC: 2400,
    AZ: 2500,
  };
  
  const sqft = (baseSquFt[request.state] || 2500) + Math.floor(Math.random() * 800) - 400;
  
  return {
    id: `mock-roofr-${Date.now()}`,
    status: 'completed', // Mock returns completed immediately
    address: fullAddress,
    sqftTotal: sqft,
    facets: [
      { id: 'f1', sqft: sqft * 0.4, pitch: 6, orientation: 'south' },
      { id: 'f2', sqft: sqft * 0.35, pitch: 6, orientation: 'north' },
      { id: 'f3', sqft: sqft * 0.15, pitch: 4, orientation: 'east' },
      { id: 'f4', sqft: sqft * 0.10, pitch: 4, orientation: 'west' },
    ],
    pitchPrimary: 6,
    complexity: sqft > 3000 ? 'complex' : sqft > 2000 ? 'moderate' : 'simple',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

export default roofrAdapter;
