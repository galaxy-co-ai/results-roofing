/**
 * SignalWire SMS Adapter
 *
 * @deprecated MIGRATED TO GOHIGHLEVEL (2026-02-03)
 * This adapter is kept for backward compatibility.
 * New code should use ghlMessagingAdapter instead.
 *
 * @see ./ghl-messaging.ts for the new implementation
 * @see https://highlevel.stoplight.io/ for GHL API docs
 */

import { logger } from '@/lib/utils';
import { ghlMessagingAdapter } from './ghl-messaging';

// Legacy SignalWire configuration (deprecated)
const SIGNALWIRE_PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || '';
const SIGNALWIRE_API_TOKEN = process.env.SIGNALWIRE_API_TOKEN || '';
const SIGNALWIRE_SPACE_URL = process.env.SIGNALWIRE_SPACE_URL || '';

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
 *
 * @deprecated Use ghlMessagingAdapter.sendSmsByPhone() instead
 */
export const signalwireAdapter = {
  /**
   * Check if SignalWire is configured
   * @deprecated GHL is now the preferred SMS provider
   */
  isConfigured(): boolean {
    // Return true if either SignalWire OR GHL is configured
    return !!(SIGNALWIRE_PROJECT_ID && SIGNALWIRE_API_TOKEN && SIGNALWIRE_SPACE_URL) ||
      ghlMessagingAdapter.isConfigured();
  },

  /**
   * Send an SMS
   * @deprecated Use ghlMessagingAdapter.sendSmsByPhone() instead
   *
   * This method now routes to GHL if configured
   */
  async send(request: SendSmsRequest): Promise<SmsResponse> {
    // Use GHL if configured (preferred)
    if (ghlMessagingAdapter.isConfigured()) {
      const result = await ghlMessagingAdapter.sendSmsByPhone(request.to, request.message);
      return {
        id: result.id,
        success: result.success,
        status: result.status === 'mock' ? 'mock' : result.success ? 'sent' : 'failed',
      };
    }

    // Legacy SignalWire path (not implemented, kept for reference)
    if (SIGNALWIRE_PROJECT_ID && SIGNALWIRE_API_TOKEN && SIGNALWIRE_SPACE_URL) {
      logger.warn('[SignalWire] Legacy SignalWire is configured but not implemented - please migrate to GHL');
    }

    // Mock response
    logger.warn('[SignalWire] SMS provider not configured - message logged only', {
      to: request.to,
      message: request.message.substring(0, 50) + '...',
    });
    return { id: `mock-sms-${Date.now()}`, success: true, status: 'mock' };
  },

  /**
   * Send quote ready SMS
   * @deprecated Use ghlMessagingAdapter.sendQuoteReadySms() instead
   */
  async sendQuoteReady(phone: string, quoteUrl: string): Promise<SmsResponse> {
    if (ghlMessagingAdapter.isConfigured()) {
      const result = await ghlMessagingAdapter.sendQuoteReadySms(phone, quoteUrl);
      return {
        id: result.id,
        success: result.success,
        status: result.status === 'mock' ? 'mock' : result.success ? 'sent' : 'failed',
      };
    }
    return this.send({
      to: phone,
      message: `Your roof quote is ready! View it here: ${quoteUrl} - Results Roofing`,
    });
  },

  /**
   * Send booking confirmation SMS
   * @deprecated Use ghlMessagingAdapter.sendBookingConfirmationSms() instead
   */
  async sendBookingConfirmation(phone: string, date: string): Promise<SmsResponse> {
    if (ghlMessagingAdapter.isConfigured()) {
      const result = await ghlMessagingAdapter.sendBookingConfirmationSms(phone, date);
      return {
        id: result.id,
        success: result.success,
        status: result.status === 'mock' ? 'mock' : result.success ? 'sent' : 'failed',
      };
    }
    return this.send({
      to: phone,
      message: `Your roof installation is scheduled for ${date}. We'll see you then! - Results Roofing`,
    });
  },

  /**
   * Send booking reminder SMS
   * @deprecated Use ghlMessagingAdapter.sendBookingReminderSms() instead
   */
  async sendBookingReminder(phone: string, date: string): Promise<SmsResponse> {
    if (ghlMessagingAdapter.isConfigured()) {
      const result = await ghlMessagingAdapter.sendBookingReminderSms(phone, date);
      return {
        id: result.id,
        success: result.success,
        status: result.status === 'mock' ? 'mock' : result.success ? 'sent' : 'failed',
      };
    }
    return this.send({
      to: phone,
      message: `Reminder: Your roof installation is tomorrow (${date}). Please ensure driveway access is clear. - Results Roofing`,
    });
  },

  /**
   * Send payment confirmation SMS
   * @deprecated Use ghlMessagingAdapter.sendPaymentConfirmationSms() instead
   */
  async sendPaymentConfirmation(phone: string, amount: string): Promise<SmsResponse> {
    if (ghlMessagingAdapter.isConfigured()) {
      const result = await ghlMessagingAdapter.sendPaymentConfirmationSms(phone, amount);
      return {
        id: result.id,
        success: result.success,
        status: result.status === 'mock' ? 'mock' : result.success ? 'sent' : 'failed',
      };
    }
    return this.send({
      to: phone,
      message: `Payment of ${amount} received. Thank you! - Results Roofing`,
    });
  },
};

export default signalwireAdapter;
