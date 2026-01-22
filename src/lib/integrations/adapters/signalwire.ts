/**
 * SignalWire SMS Adapter
 * STUB - Awaiting client SignalWire account
 * 
 * @see https://developer.signalwire.com/
 */

import { logger } from '@/lib/utils';

// Configuration from environment
const SIGNALWIRE_PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || '';
const SIGNALWIRE_API_TOKEN = process.env.SIGNALWIRE_API_TOKEN || '';
const SIGNALWIRE_SPACE_URL = process.env.SIGNALWIRE_SPACE_URL || '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SIGNALWIRE_FROM_NUMBER = process.env.SIGNALWIRE_FROM_NUMBER || '';

/**
 * SMS request
 */
export interface SendSmsRequest {
  to: string;
  message: string;
  quoteId?: string;
}

/**
 * SMS response
 */
export interface SmsResponse {
  id: string;
  success: boolean;
  status: 'sent' | 'failed' | 'mock';
}

/**
 * SignalWire SMS Adapter
 */
export const signalwireAdapter = {
  /**
   * Check if SignalWire is configured
   */
  isConfigured(): boolean {
    return !!(SIGNALWIRE_PROJECT_ID && SIGNALWIRE_API_TOKEN && SIGNALWIRE_SPACE_URL);
  },

  /**
   * Send an SMS
   * STUB - Logs message and returns mock response
   */
  async send(request: SendSmsRequest): Promise<SmsResponse> {
    if (!this.isConfigured()) {
      logger.warn('SignalWire not configured - SMS not sent', {
        to: request.to,
        message: request.message.substring(0, 50) + '...',
      });
      return { id: `mock-sms-${Date.now()}`, success: true, status: 'mock' };
    }

    // TODO: Implement actual SignalWire API call
    // const response = await fetch(`https://${SIGNALWIRE_SPACE_URL}/api/laml/2010-04-01/Accounts/${SIGNALWIRE_PROJECT_ID}/Messages.json`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(`${SIGNALWIRE_PROJECT_ID}:${SIGNALWIRE_API_TOKEN}`).toString('base64')}`,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     From: SIGNALWIRE_FROM_NUMBER,
    //     To: request.to,
    //     Body: request.message,
    //   }),
    // });

    logger.warn('SignalWire integration not implemented - SMS logged only', {
      to: request.to,
    });
    return { id: `mock-sms-${Date.now()}`, success: true, status: 'mock' };
  },

  /**
   * Send quote ready SMS
   */
  async sendQuoteReady(phone: string, quoteUrl: string): Promise<SmsResponse> {
    return this.send({
      to: phone,
      message: `Your roof quote is ready! View it here: ${quoteUrl} - Results Roofing`,
    });
  },

  /**
   * Send booking confirmation SMS
   */
  async sendBookingConfirmation(phone: string, date: string): Promise<SmsResponse> {
    return this.send({
      to: phone,
      message: `Your roof installation is scheduled for ${date}. We'll see you then! - Results Roofing`,
    });
  },

  /**
   * Send booking reminder SMS
   */
  async sendBookingReminder(phone: string, date: string): Promise<SmsResponse> {
    return this.send({
      to: phone,
      message: `Reminder: Your roof installation is tomorrow (${date}). Please ensure driveway access is clear. - Results Roofing`,
    });
  },

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(phone: string, amount: string): Promise<SmsResponse> {
    return this.send({
      to: phone,
      message: `Payment of ${amount} received. Thank you! - Results Roofing`,
    });
  },
};

export default signalwireAdapter;
