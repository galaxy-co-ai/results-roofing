/**
 * Documenso E-Signature Adapter
 * STUB - Awaiting client Documenso account setup
 * 
 * @see https://documenso.com/docs/api
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const DOCUMENSO_API_KEY = process.env.DOCUMENSO_API_KEY || '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _DOCUMENSO_API_URL = process.env.DOCUMENSO_API_URL || 'https://app.documenso.com/api/v1';

/**
 * Document creation request
 */
export interface CreateDocumentRequest {
  quoteId: string;
  customerName: string;
  customerEmail: string;
  propertyAddress: string;
  packageTier: string;
  totalPrice: number;
  depositAmount: number;
  estimatedStartDate?: string;
}

/**
 * Document response
 */
export interface DocumentResponse {
  id: number;
  externalId: string;
  title: string;
  status: 'DRAFT' | 'PENDING' | 'COMPLETED';
  signingUrl?: string;
  createdAt: string;
}

/**
 * Documenso E-Signature Adapter
 */
export const documensoAdapter = {
  /**
   * Check if Documenso is configured
   */
  isConfigured(): boolean {
    return !!DOCUMENSO_API_KEY;
  },

  /**
   * Create a contract document for signing
   * STUB - Returns mock data
   */
  async createDocument(request: CreateDocumentRequest): Promise<DocumentResponse> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured - returning mock document');
      return generateMockDocument(request);
    }

    // TODO: Implement actual Documenso API call
    // const response = await fetch(`${DOCUMENSO_API_URL}/documents`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${DOCUMENSO_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     title: `Results Roofing Contract - ${request.propertyAddress}`,
    //     recipients: [{ email: request.customerEmail, name: request.customerName }],
    //     meta: { quoteId: request.quoteId },
    //   }),
    // });

    logger.warn('Documenso integration not fully implemented - returning mock');
    return generateMockDocument(request);
  },

  /**
   * Get document status
   * STUB - Returns mock data
   */
  async getDocument(_documentId: string): Promise<DocumentResponse | null> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured');
      return null;
    }

    // TODO: Implement actual API call
    logger.warn('Documenso getDocument not implemented');
    return null;
  },

  /**
   * Get signing URL for a recipient
   * STUB - Returns mock URL
   */
  async getSigningUrl(documentId: string, _recipientEmail: string): Promise<string | null> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured - returning mock signing URL');
      return `https://app.documenso.com/sign/mock-${documentId}`;
    }

    // TODO: Implement actual API call
    return `https://app.documenso.com/sign/mock-${documentId}`;
  },

  /**
   * Download signed document
   * STUB - Returns null
   */
  async downloadDocument(_documentId: string): Promise<Buffer | null> {
    if (!this.isConfigured()) {
      return null;
    }

    // TODO: Implement actual API call
    return null;
  },
};

/**
 * Generate mock document for development
 */
function generateMockDocument(request: CreateDocumentRequest): DocumentResponse {
  return {
    id: Math.floor(Math.random() * 100000),
    externalId: `mock-doc-${request.quoteId}-${Date.now()}`,
    title: `Results Roofing Contract - ${request.propertyAddress}`,
    status: 'PENDING',
    signingUrl: `https://app.documenso.com/sign/mock-${request.quoteId}`,
    createdAt: new Date().toISOString(),
  };
}

export default documensoAdapter;
