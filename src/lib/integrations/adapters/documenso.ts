/**
 * Documenso E-Signature Adapter
 *
 * @see https://documenso.com/docs/api
 *
 * Environment variables required:
 * - DOCUMENSO_API_KEY: API key for authentication
 * - DOCUMENSO_API_URL: API base URL (default: https://app.documenso.com/api/v1)
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const DOCUMENSO_API_KEY = process.env.DOCUMENSO_API_KEY || '';
const DOCUMENSO_API_URL = process.env.DOCUMENSO_API_URL || 'https://app.documenso.com/api/v1';

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
 * Make authenticated request to Documenso API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DOCUMENSO_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${DOCUMENSO_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Documenso API error: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<T>;
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
   */
  async createDocument(request: CreateDocumentRequest): Promise<DocumentResponse> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured - returning mock document');
      return generateMockDocument(request);
    }

    try {
      // Create document from template
      // Note: This assumes a template ID is configured in Documenso
      // You may need to adjust based on your Documenso setup
      const response = await apiRequest<{
        id: number;
        externalId: string;
        title: string;
        status: string;
        createdAt: string;
      }>('/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: `Results Roofing Contract - ${request.propertyAddress}`,
          externalId: request.quoteId,
          recipients: [
            {
              email: request.customerEmail,
              name: request.customerName,
              role: 'SIGNER',
            },
          ],
          meta: {
            quoteId: request.quoteId,
            propertyAddress: request.propertyAddress,
            packageTier: request.packageTier,
            totalPrice: request.totalPrice,
            depositAmount: request.depositAmount,
            estimatedStartDate: request.estimatedStartDate,
          },
        }),
      });

      logger.info('Documenso document created', {
        documentId: response.id,
        quoteId: request.quoteId,
      });

      return {
        id: response.id,
        externalId: response.externalId || request.quoteId,
        title: response.title,
        status: response.status as DocumentResponse['status'],
        createdAt: response.createdAt,
      };
    } catch (error) {
      logger.error('Documenso createDocument failed', error);
      // Return mock on error to not block the flow
      return generateMockDocument(request);
    }
  },

  /**
   * Send document for signature
   */
  async sendForSignature(documentId: number): Promise<{ success: boolean; signingUrl?: string }> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured - returning mock signing URL');
      return {
        success: true,
        signingUrl: `https://app.documenso.com/sign/mock-${documentId}`,
      };
    }

    try {
      const response = await apiRequest<{
        success: boolean;
        signingUrl?: string;
      }>(`/documents/${documentId}/send`, {
        method: 'POST',
      });

      logger.info('Document sent for signature', { documentId });
      return response;
    } catch (error) {
      logger.error('Documenso sendForSignature failed', error);
      return { success: false };
    }
  },

  /**
   * Get document status
   */
  async getDocument(documentId: string): Promise<DocumentResponse | null> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured');
      return null;
    }

    try {
      const response = await apiRequest<{
        id: number;
        externalId: string;
        title: string;
        status: string;
        createdAt: string;
        completedAt?: string;
      }>(`/documents/${documentId}`);

      return {
        id: response.id,
        externalId: response.externalId,
        title: response.title,
        status: response.status as DocumentResponse['status'],
        createdAt: response.createdAt,
      };
    } catch (error) {
      logger.error('Documenso getDocument failed', error);
      return null;
    }
  },

  /**
   * Get signing URL for a recipient
   */
  async getSigningUrl(documentId: string, recipientEmail: string): Promise<string | null> {
    if (!this.isConfigured()) {
      logger.warn('Documenso not configured - returning mock signing URL');
      return `https://app.documenso.com/sign/mock-${documentId}`;
    }

    try {
      const response = await apiRequest<{
        signingUrl: string;
      }>(`/documents/${documentId}/signing-url`, {
        method: 'POST',
        body: JSON.stringify({ email: recipientEmail }),
      });

      return response.signingUrl;
    } catch (error) {
      logger.error('Documenso getSigningUrl failed', error);
      return null;
    }
  },

  /**
   * Download signed document as PDF
   */
  async downloadDocument(documentId: string): Promise<Buffer | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const url = `${DOCUMENSO_API_URL}/documents/${documentId}/download`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${DOCUMENSO_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      logger.error('Documenso downloadDocument failed', error);
      return null;
    }
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
