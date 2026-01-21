/**
 * Core type definitions for Results Roofing
 */

import type {
  PackageTier,
  QuoteStatus,
  ReplacementMotivation,
  ServiceState,
} from '@/lib/constants';

/**
 * Server Action result type
 * Used for all Server Actions to provide consistent error handling
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * API error response
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Address type used throughout the application
 */
export interface Address {
  street: string;
  city: string;
  state: ServiceState;
  zipCode: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

/**
 * Quote summary for display
 */
export interface QuoteSummary {
  id: string;
  status: QuoteStatus;
  address: Address;
  createdAt: Date;
  selectedTier?: PackageTier;
  totalPrice?: number;
  motivation?: ReplacementMotivation;
}

/**
 * Package tier pricing
 */
export interface TierPricing {
  tier: PackageTier;
  basePrice: number;
  totalPrice: number;
  materials: string[];
  warranty: string;
  leadTime: string;
}
