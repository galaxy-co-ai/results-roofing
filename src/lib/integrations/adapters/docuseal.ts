/**
 * DocuSeal E-Signature Adapter
 *
 * @see https://www.docuseal.com/docs/api
 *
 * Environment variables required:
 * - DOCUSEAL_API_KEY: API key for authentication
 */

import { logger } from '@/lib/utils';

const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY || '';
const DOCUSEAL_API_URL = 'https://api.docuseal.com';

// ============================================
// Types
// ============================================

export interface CreateTemplateRequest {
  name: string;
  html: string;
}

export interface TemplateResponse {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
}

export interface CreateSubmissionRequest {
  templateId: number;
  customerName: string;
  customerEmail: string;
  propertyAddress: string;
  packageTier: string;
  totalPrice: number;
  depositAmount: number;
  installDate?: string;
  quoteId: string;
}

export interface SubmissionResponse {
  id: number;
  slug: string;
  embed_src: string;
  status: 'pending' | 'sent' | 'completed' | 'declined';
  email: string;
}

export interface SubmissionStatus {
  id: number;
  status: 'pending' | 'sent' | 'completed' | 'declined';
  completed_at?: string;
  documents?: Array<{
    name: string;
    url: string;
  }>;
}

// ============================================
// API Helper
// ============================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DOCUSEAL_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Auth-Token': DOCUSEAL_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DocuSeal API error: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ============================================
// Deposit Authorization Template HTML
// ============================================

function generateDepositAuthHTML(params: {
  customerName: string;
  propertyAddress: string;
  packageTier: string;
  totalPrice: number;
  depositAmount: number;
  installDate?: string;
}): string {
  const formattedDate = params.installDate
    ? new Date(params.installDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a1a; margin-bottom: 5px;">Results Roofing</h1>
        <p style="color: #666; margin: 0;">Deposit Authorization</p>
      </div>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px 0;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Property:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${params.propertyAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Package:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${params.packageTier}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Installation Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${formattedDate}</td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 12px 0 8px; color: #666;">Total Project Cost:</td>
            <td style="padding: 12px 0 8px; text-align: right; font-weight: 600; font-size: 18px;">$${params.totalPrice.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Deposit Due Today:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #059669;">$${params.depositAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; color: #1a1a1a; margin: 0 0 12px 0;">Authorization</h2>
        <p style="color: #4b5563; line-height: 1.6; margin: 0;">
          I, <text-field name="Full Name" role="Customer" required="true" style="width: 200px; height: 20px;"></text-field>,
          authorize Results Roofing to charge <strong>$${params.depositAmount}</strong> to secure my installation date.
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin: 16px 0 0 0;">
          I understand this deposit is <strong style="color: #059669;">fully refundable</strong> if I cancel within
          <strong>3 business days</strong> of signing this authorization.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; color: #1a1a1a; margin: 0 0 12px 0;">Terms & Conditions</h2>
        <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li>Deposit secures your installation date and crew assignment</li>
          <li>Balance due upon satisfactory completion of work</li>
          <li>Work includes all materials and labor as specified in quote</li>
          <li>Standard manufacturer warranty applies to all materials</li>
          <li>5-year workmanship warranty on all installation work</li>
        </ul>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
        <p style="color: #4b5563; margin: 0 0 16px 0;">
          <checkbox name="I agree to the terms" role="Customer" required="true"></checkbox>
          I have read and agree to the terms and conditions above.
        </p>

        <div style="margin-top: 24px;">
          <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Customer Signature:</p>
          <signature-field name="Signature" role="Customer" required="true" style="width: 100%; height: 80px;"></signature-field>
        </div>

        <div style="margin-top: 16px;">
          <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Date:</p>
          <date-field name="Date" role="Customer" required="true" style="width: 150px; height: 20px;"></date-field>
        </div>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Results Roofing · Trusted Local Roofing Professionals<br/>
          Questions? Contact us at support@resultsroofing.com
        </p>
      </div>
    </div>
  `;
}

// ============================================
// DocuSeal Adapter
// ============================================

export const docusealAdapter = {
  /**
   * Check if DocuSeal is configured
   */
  isConfigured(): boolean {
    return !!DOCUSEAL_API_KEY;
  },

  /**
   * Create a template from HTML
   */
  async createTemplate(name: string, html: string): Promise<TemplateResponse> {
    if (!this.isConfigured()) {
      throw new Error('DocuSeal not configured');
    }

    const response = await apiRequest<TemplateResponse>('/templates/html', {
      method: 'POST',
      body: JSON.stringify({
        name,
        html,
      }),
    });

    logger.info('DocuSeal template created', {
      templateId: response.id,
      name: response.name,
    });

    return response;
  },

  /**
   * List templates
   */
  async listTemplates(): Promise<TemplateResponse[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const response = await apiRequest<{ data: TemplateResponse[] }>('/templates');
    return response.data;
  },

  /**
   * Get or create the deposit authorization template
   */
  async getDepositTemplate(): Promise<TemplateResponse | null> {
    if (!this.isConfigured()) {
      logger.warn('DocuSeal not configured');
      return null;
    }

    try {
      // Check if template already exists
      const templates = await this.listTemplates();
      const existing = templates.find((t) => t.name === 'Deposit Authorization');

      if (existing) {
        logger.info('Found existing deposit template', { templateId: existing.id });
        return existing;
      }

      // Create new template with placeholder values (will be filled per-submission)
      const html = generateDepositAuthHTML({
        customerName: '{{customer_name}}',
        propertyAddress: '{{property_address}}',
        packageTier: '{{package_tier}}',
        totalPrice: 0,
        depositAmount: 0,
      });

      const template = await this.createTemplate('Deposit Authorization', html);
      return template;
    } catch (error) {
      logger.error('Failed to get/create deposit template', error);
      return null;
    }
  },

  /**
   * Create a submission (signing request) for deposit authorization
   */
  async createSubmission(request: CreateSubmissionRequest): Promise<SubmissionResponse | null> {
    if (!this.isConfigured()) {
      logger.warn('DocuSeal not configured - returning mock submission');
      return {
        id: Math.floor(Math.random() * 100000),
        slug: `mock-${request.quoteId}`,
        embed_src: `https://docuseal.com/s/mock-${request.quoteId}`,
        status: 'pending',
        email: request.customerEmail,
      };
    }

    try {
      // Generate HTML with actual values for this submission
      const html = generateDepositAuthHTML({
        customerName: request.customerName,
        propertyAddress: request.propertyAddress,
        packageTier: request.packageTier,
        totalPrice: request.totalPrice,
        depositAmount: request.depositAmount,
        installDate: request.installDate,
      });

      // Create submission directly from HTML (creates doc + sends for signing)
      const response = await apiRequest<SubmissionResponse[]>('/submissions/html', {
        method: 'POST',
        body: JSON.stringify({
          html,
          name: `Deposit Auth - ${request.propertyAddress}`,
          send_email: false, // We handle our own notifications
          submitters: [
            {
              role: 'Customer',
              email: request.customerEmail,
              name: request.customerName,
            },
          ],
          external_id: request.quoteId,
          completed_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/quote/${request.quoteId}/deposit?signed=true`,
        }),
      });

      const submission = response[0];

      logger.info('DocuSeal submission created', {
        submissionId: submission.id,
        quoteId: request.quoteId,
        embedSrc: submission.embed_src,
      });

      return submission;
    } catch (error) {
      logger.error('DocuSeal createSubmission failed', error);
      return null;
    }
  },

  /**
   * Get submission status
   */
  async getSubmission(submissionId: number): Promise<SubmissionStatus | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await apiRequest<SubmissionStatus>(`/submissions/${submissionId}`);
      return response;
    } catch (error) {
      logger.error('DocuSeal getSubmission failed', error);
      return null;
    }
  },

  /**
   * Get submission by external ID (quote ID)
   */
  async getSubmissionByQuoteId(quoteId: string): Promise<SubmissionStatus | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await apiRequest<{ data: SubmissionStatus[] }>(
        `/submissions?external_id=${quoteId}`
      );
      return response.data[0] || null;
    } catch (error) {
      logger.error('DocuSeal getSubmissionByQuoteId failed', error);
      return null;
    }
  },
};

export default docusealAdapter;
