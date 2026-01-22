/**
 * Resend Email Adapter
 * STUB - Awaiting client Resend account
 * 
 * @see https://resend.com/docs
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resultsroofing.com';

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
}

/**
 * Resend Email Adapter
 */
export const resendAdapter = {
  /**
   * Check if Resend is configured
   */
  isConfigured(): boolean {
    return !!RESEND_API_KEY;
  },

  /**
   * Send an email
   * STUB - Logs email and returns mock response
   */
  async send(request: SendEmailRequest): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      logger.warn('Resend not configured - email not sent', {
        to: request.to,
        subject: request.subject,
        template: request.template,
      });
      return { id: `mock-email-${Date.now()}`, success: true };
    }

    // TODO: Implement actual Resend API call
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: FROM_EMAIL,
    //     to: request.to,
    //     subject: request.subject,
    //     html: renderTemplate(request.template, request.data),
    //   }),
    // });

    logger.warn('Resend integration not implemented - email logged only', {
      to: request.to,
      subject: request.subject,
    });
    return { id: `mock-email-${Date.now()}`, success: true };
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
};

export default resendAdapter;
