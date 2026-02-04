/**
 * Roof Measurement Adapter
 * STUB - Awaiting client credentials
 *
 * MIGRATION NOTE (2026-02-03):
 * Migrating from Roofr to GAF QuickMeasure
 * @see https://www.gaf.com/en-us/resources/business-services/quickmeasure
 *
 * TODO: Confirm GAF QuickMeasure API availability before implementation
 * - Need to verify API endpoints and authentication method
 * - Confirm webhook support for measurement completion
 * - Check turnaround time (Roofr was ~30s, GAF may differ)
 */

import { logger } from '@/lib/utils';
import { 
  MEASUREMENT_TIMINGS, 
  calculateBackoff,
  type MeasurementData 
} from '@/lib/measurement';

// Configuration from environment
const ROOFR_API_KEY = process.env.ROOFR_API_KEY || '';
const ROOFR_API_URL = process.env.ROOFR_API_URL || 'https://api.roofr.com/v1';

/**
 * Custom error for measurement timeout
 */
export class MeasurementTimeoutError extends Error {
  constructor(message: string = 'Measurement timed out') {
    super(message);
    this.name = 'MeasurementTimeoutError';
  }
}

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
  async requestMeasurement(
    request: MeasurementRequest,
    options?: { signal?: AbortSignal }
  ): Promise<MeasurementReport> {
    if (!this.isConfigured()) {
      logger.warn('Roofr not configured - returning mock measurement');
      // Simulate some delay for realistic testing
      await simulateDelay(2000, options?.signal);
      return generateMockMeasurement(request);
    }

    // Actual API implementation (when credentials available)
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      MEASUREMENT_TIMINGS.TIMEOUT_THRESHOLD
    );

    try {
      const response = await fetch(`${ROOFR_API_URL}/measurements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ROOFR_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: options?.signal || controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Roofr API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MeasurementTimeoutError('Measurement request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Get measurement status/report
   * STUB - Returns mock data
   */
  async getMeasurement(
    measurementId: string,
    options?: { signal?: AbortSignal }
  ): Promise<MeasurementReport | null> {
    if (!this.isConfigured()) {
      // Return mock in-progress or completed based on time
      logger.warn('Roofr not configured - returning mock status');
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

    try {
      const response = await fetch(`${ROOFR_API_URL}/measurements/${measurementId}`, {
        headers: {
          'Authorization': `Bearer ${ROOFR_API_KEY}`,
        },
        signal: options?.signal,
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Roofr API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MeasurementTimeoutError('Get measurement request aborted');
      }
      throw error;
    }
  },

  /**
   * Poll for measurement completion with exponential backoff
   * Throws MeasurementTimeoutError if timeout is reached
   */
  async pollUntilComplete(
    measurementId: string,
    options?: {
      maxAttempts?: number;
      timeoutMs?: number;
      onProgress?: (attempt: number, status: string) => void;
    }
  ): Promise<MeasurementReport> {
    const maxAttempts = options?.maxAttempts || MEASUREMENT_TIMINGS.MAX_POLL_ATTEMPTS;
    const timeoutMs = options?.timeoutMs || MEASUREMENT_TIMINGS.TIMEOUT_THRESHOLD;
    const startTime = Date.now();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if we've exceeded the timeout
      if (Date.now() - startTime >= timeoutMs) {
        throw new MeasurementTimeoutError(
          `Measurement timed out after ${timeoutMs / 1000} seconds`
        );
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt);

      // Wait before polling (skip on first attempt)
      if (attempt > 0) {
        await sleep(delay);
      }

      try {
        const report = await this.getMeasurement(measurementId);

        if (!report) {
          options?.onProgress?.(attempt, 'not_found');
          continue;
        }

        options?.onProgress?.(attempt, report.status);

        if (report.status === 'completed') {
          return report;
        }

        if (report.status === 'failed') {
          throw new Error('Measurement failed');
        }

        // Continue polling for 'pending' or 'processing' status
      } catch (error) {
        if (error instanceof MeasurementTimeoutError) {
          throw error;
        }
        // Log error but continue polling
        logger.warn(`Poll attempt ${attempt + 1} failed`, { error });
      }
    }

    throw new MeasurementTimeoutError(
      `Measurement did not complete after ${maxAttempts} attempts`
    );
  },

  /**
   * Convert Roofr report to internal MeasurementData format
   */
  toMeasurementData(report: MeasurementReport): MeasurementData {
    return {
      sqftTotal: report.sqftTotal || 2500,
      pitchPrimary: report.pitchPrimary || 6,
      complexity: report.complexity || 'moderate',
      source: 'roofr',
    };
  },
};

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulate delay with abort signal support
 */
async function simulateDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new MeasurementTimeoutError('Request aborted'));
      });
    }
  });
}

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
