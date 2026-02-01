/**
 * Resend Email Adapter
 * Sends transactional emails via Resend API
 *
 * @see https://resend.com/docs
 */

import { Resend } from 'resend';
import { logger } from '@/lib/utils';

// Configuration from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'dev@galaxyco.ai';

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Email request
 */
export interface SendEmailRequest {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

/**
 * Available email templates
 */
export type EmailTemplate =
  | 'quote_ready'
  | 'quote_resume'
  | 'signature_request'
  | 'payment_confirmation'
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'project_update';

/**
 * Email response
 */
export interface EmailResponse {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * Render email template to HTML
 */
function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #1d4ed8; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
    .highlight { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .amount { font-size: 32px; font-weight: 700; color: #2563eb; }
  `;

  const templates: Record<EmailTemplate, string> = {
    quote_ready: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Your Roof Quote is Ready!</h1>
        </div>
        <div class="content">
          <p>Great news! Your instant roof replacement quote is ready to view.</p>
          <p>We've calculated an accurate estimate based on satellite measurements of your property.</p>
          <div style="text-align: center;">
            <a href="${data.quoteUrl}" class="button">View My Quote</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Quote ID: ${data.quoteId}</p>
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
          <p>Questions? Reply to this email.</p>
        </div>
      </body>
      </html>
    `,

    quote_resume: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Continue Your Quote</h1>
        </div>
        <div class="content">
          <p>You started a roof quote for:</p>
          <div class="highlight">
            <strong>${data.address}</strong><br>
            ${data.city}, ${data.state}
          </div>
          <p>Pick up right where you left off:</p>
          <div style="text-align: center;">
            <a href="${data.resumeUrl}" class="button">Continue My Quote</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">This link expires ${data.expiresAt}</p>
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
        </div>
      </body>
      </html>
    `,

    signature_request: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Contract Ready for Signature</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Your roofing contract is ready for electronic signature. Please review and sign to confirm your installation date.</p>
          <div style="text-align: center;">
            <a href="${data.signatureUrl}" class="button">Review & Sign</a>
          </div>
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
        </div>
      </body>
      </html>
    `,

    payment_confirmation: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Payment Received</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Thank you! We've received your deposit payment.</p>
          <div class="highlight" style="text-align: center;">
            <div class="amount">$${typeof data.amount === 'number' ? data.amount.toLocaleString() : data.amount}</div>
            <p style="margin: 5px 0; color: #64748b;">Confirmation: ${data.confirmationNumber}</p>
          </div>
          <p>Your installation is confirmed. We'll send a reminder before your scheduled date.</p>
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
        </div>
      </body>
      </html>
    `,

    booking_confirmation: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Installation Scheduled!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Your roof installation is confirmed:</p>
          <div class="highlight">
            <strong>Date:</strong> ${data.date}<br>
            <strong>Address:</strong> ${data.address}<br>
            <strong>Confirmation:</strong> ${data.confirmationNumber}
          </div>
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Our crew will arrive between 7-8 AM</li>
            <li>Installation typically takes 1-2 days</li>
            <li>We'll handle all debris removal</li>
            <li>Final walkthrough upon completion</li>
          </ul>
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
          <p>Questions? Reply to this email.</p>
        </div>
      </body>
      </html>
    `,

    booking_reminder: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Installation Tomorrow!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>This is a reminder that your roof installation is scheduled for <strong>tomorrow</strong>.</p>
          <div class="highlight">
            <strong>Date:</strong> ${data.date}<br>
            <strong>Address:</strong> ${data.address}
          </div>
          <p><strong>Please ensure:</strong></p>
          <ul>
            <li>Vehicles are moved away from the work area</li>
            <li>Pets are secured inside</li>
            <li>Fragile items in attic are protected</li>
          </ul>
          <p>Our crew will arrive between 7-8 AM.</p>
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
        </div>
      </body>
      </html>
    `,

    project_update: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="header">
          <h1>Project Update</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>${data.message}</p>
          ${data.portalUrl ? `
          <div style="text-align: center;">
            <a href="${data.portalUrl}" class="button">View in Portal</a>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>Results Roofing | TX · GA · NC · AZ · OK</p>
        </div>
      </body>
      </html>
    `,
  };

  return templates[template] || templates.project_update;
}

/**
 * Resend Email Adapter
 */
export const resendAdapter = {
  /**
   * Check if Resend is configured
   */
  isConfigured(): boolean {
    return !!resend;
  },

  /**
   * Send an email
   */
  async send(request: SendEmailRequest): Promise<EmailResponse> {
    if (!resend) {
      logger.warn('Resend not configured - email not sent', {
        to: request.to,
        subject: request.subject,
        template: request.template,
      });
      return { id: `mock-${Date.now()}`, success: false, error: 'Resend not configured' };
    }

    try {
      const html = renderTemplate(request.template, request.data);

      const { data, error } = await resend.emails.send({
        from: `Results Roofing <${FROM_EMAIL}>`,
        to: request.to,
        subject: request.subject,
        html,
      });

      if (error) {
        logger.error('Resend email failed', { error, to: request.to, subject: request.subject });
        return { id: '', success: false, error: error.message };
      }

      logger.info('Email sent successfully', {
        id: data?.id,
        to: request.to,
        template: request.template
      });

      return { id: data?.id || '', success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Resend email exception', { error: errorMessage, to: request.to });
      return { id: '', success: false, error: errorMessage };
    }
  },

  /**
   * Send quote ready notification
   */
  async sendQuoteReady(email: string, quoteId: string, quoteUrl: string): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Your Roof Quote is Ready - Results Roofing',
      template: 'quote_ready',
      data: { quoteId, quoteUrl },
    });
  },

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(
    email: string,
    data: { customerName: string; date: string; address: string; confirmationNumber: string }
  ): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Installation Scheduled - Results Roofing',
      template: 'booking_confirmation',
      data,
    });
  },

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(
    email: string,
    data: { customerName: string; amount: number; confirmationNumber: string }
  ): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Payment Received - Results Roofing',
      template: 'payment_confirmation',
      data,
    });
  },

  /**
   * Send quote resume link
   */
  async sendQuoteResume(
    email: string,
    data: {
      resumeUrl: string;
      address: string;
      city: string;
      state: string;
      expiresAt: string;
    }
  ): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Your Saved Quote - Results Roofing',
      template: 'quote_resume',
      data,
    });
  },

  /**
   * Send booking reminder (day before)
   */
  async sendBookingReminder(
    email: string,
    data: { customerName: string; date: string; address: string }
  ): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Installation Tomorrow - Results Roofing',
      template: 'booking_reminder',
      data,
    });
  },

  /**
   * Send signature request
   */
  async sendSignatureRequest(
    email: string,
    data: { customerName: string; signatureUrl: string }
  ): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Contract Ready for Signature - Results Roofing',
      template: 'signature_request',
      data,
    });
  },

  /**
   * Send project update
   */
  async sendProjectUpdate(
    email: string,
    data: { customerName: string; message: string; portalUrl?: string }
  ): Promise<EmailResponse> {
    return this.send({
      to: email,
      subject: 'Project Update - Results Roofing',
      template: 'project_update',
      data,
    });
  },
};

export default resendAdapter;
