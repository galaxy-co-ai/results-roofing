/**
 * GoHighLevel Messaging Adapter
 * Unified SMS and Email via GHL Conversations API
 *
 * This adapter provides a unified interface for SMS (replacing SignalWire)
 * and can also send emails (alternative to Resend).
 *
 * @see https://highlevel.stoplight.io/docs/integrations
 */

import { logger } from '@/lib/utils';

// Configuration check
const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';

/**
 * SMS request interface
 */
export interface GHLSendSmsRequest {
  contactId: string;
  message: string;
  scheduledTimestamp?: number;
}

/**
 * Email request interface
 */
export interface GHLSendEmailRequest {
  contactId: string;
  subject: string;
  html: string;
  emailFrom?: string;
  scheduledTimestamp?: number;
}

/**
 * Message response interface
 */
export interface GHLMessageResponse {
  id: string;
  success: boolean;
  status: 'sent' | 'pending' | 'scheduled' | 'failed' | 'mock';
  error?: string;
}

/**
 * Check if GHL is configured
 */
function isConfigured(): boolean {
  return !!(GHL_API_KEY && GHL_LOCATION_ID);
}

/**
 * Get or create a contact by phone/email, returning the contact ID
 */
async function getOrCreateContactId(params: {
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}): Promise<string | null> {
  if (!isConfigured()) {
    return null;
  }

  try {
    // Dynamic import to avoid circular dependencies and allow lazy loading
    const { lookupContact, createContact } = await import('@/lib/ghl/api/contacts');

    // Try to find existing contact
    let contact = await lookupContact({
      phone: params.phone,
      email: params.email,
    });

    // Create if not found
    if (!contact) {
      contact = await createContact({
        phone: params.phone,
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        source: 'results-roofing-app',
      });
    }

    return contact.id;
  } catch (error) {
    logger.error('[GHL Messaging] Failed to get/create contact', error);
    return null;
  }
}

/**
 * GoHighLevel Messaging Adapter
 */
export const ghlMessagingAdapter = {
  /**
   * Check if GHL messaging is configured
   */
  isConfigured,

  /**
   * Send an SMS via GHL
   */
  async sendSms(request: GHLSendSmsRequest): Promise<GHLMessageResponse> {
    if (!isConfigured()) {
      logger.warn('[GHL Messaging] GHL not configured - SMS not sent', {
        contactId: request.contactId,
        message: request.message.substring(0, 50) + '...',
      });
      return { id: `mock-sms-${Date.now()}`, success: true, status: 'mock' };
    }

    try {
      const { sendSMS } = await import('@/lib/ghl/api/conversations');
      const message = await sendSMS(request.contactId, request.message, {
        scheduledTimestamp: request.scheduledTimestamp,
      });

      logger.info('[GHL Messaging] SMS sent successfully', {
        messageId: message.id,
        contactId: request.contactId,
        status: message.status,
      });

      return {
        id: message.id,
        success: true,
        status: message.status === 'scheduled' ? 'scheduled' : 'sent',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[GHL Messaging] SMS send failed', { error: errorMessage, contactId: request.contactId });
      return { id: '', success: false, status: 'failed', error: errorMessage };
    }
  },

  /**
   * Send an SMS by phone number (will lookup/create contact first)
   */
  async sendSmsByPhone(
    phone: string,
    message: string,
    options?: { firstName?: string; lastName?: string; scheduledTimestamp?: number }
  ): Promise<GHLMessageResponse> {
    if (!isConfigured()) {
      logger.warn('[GHL Messaging] GHL not configured - SMS not sent', {
        phone,
        message: message.substring(0, 50) + '...',
      });
      return { id: `mock-sms-${Date.now()}`, success: true, status: 'mock' };
    }

    const contactId = await getOrCreateContactId({
      phone,
      firstName: options?.firstName,
      lastName: options?.lastName,
    });

    if (!contactId) {
      return { id: '', success: false, status: 'failed', error: 'Failed to get/create contact' };
    }

    return this.sendSms({
      contactId,
      message,
      scheduledTimestamp: options?.scheduledTimestamp,
    });
  },

  /**
   * Send an email via GHL
   */
  async sendEmail(request: GHLSendEmailRequest): Promise<GHLMessageResponse> {
    if (!isConfigured()) {
      logger.warn('[GHL Messaging] GHL not configured - Email not sent', {
        contactId: request.contactId,
        subject: request.subject,
      });
      return { id: `mock-email-${Date.now()}`, success: true, status: 'mock' };
    }

    try {
      const { sendEmail } = await import('@/lib/ghl/api/conversations');
      const message = await sendEmail(request.contactId, {
        subject: request.subject,
        html: request.html,
        emailFrom: request.emailFrom,
        scheduledTimestamp: request.scheduledTimestamp,
      });

      logger.info('[GHL Messaging] Email sent successfully', {
        messageId: message.id,
        contactId: request.contactId,
        subject: request.subject,
      });

      return {
        id: message.id,
        success: true,
        status: message.status === 'scheduled' ? 'scheduled' : 'sent',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[GHL Messaging] Email send failed', { error: errorMessage, contactId: request.contactId });
      return { id: '', success: false, status: 'failed', error: errorMessage };
    }
  },

  /**
   * Send quote ready SMS
   */
  async sendQuoteReadySms(phone: string, quoteUrl: string): Promise<GHLMessageResponse> {
    return this.sendSmsByPhone(
      phone,
      `Your roof quote is ready! View it here: ${quoteUrl} - Results Roofing`
    );
  },

  /**
   * Send booking confirmation SMS
   */
  async sendBookingConfirmationSms(phone: string, date: string): Promise<GHLMessageResponse> {
    return this.sendSmsByPhone(
      phone,
      `Your roof installation is scheduled for ${date}. We'll see you then! - Results Roofing`
    );
  },

  /**
   * Send booking reminder SMS
   */
  async sendBookingReminderSms(phone: string, date: string): Promise<GHLMessageResponse> {
    return this.sendSmsByPhone(
      phone,
      `Reminder: Your roof installation is tomorrow (${date}). Please ensure driveway access is clear. - Results Roofing`
    );
  },

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSms(phone: string, amount: string): Promise<GHLMessageResponse> {
    return this.sendSmsByPhone(
      phone,
      `Payment of ${amount} received. Thank you! - Results Roofing`
    );
  },

  /**
   * Send contract signed confirmation SMS
   */
  async sendContractSignedSms(phone: string): Promise<GHLMessageResponse> {
    return this.sendSmsByPhone(
      phone,
      `Your roofing contract has been signed! We'll be in touch soon to confirm your installation date. - Results Roofing`
    );
  },

  /**
   * Sync a customer to GHL CRM
   */
  async syncCustomerToCRM(params: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    tags?: string[];
    source?: string;
  }): Promise<{ contactId: string; success: boolean; error?: string }> {
    if (!isConfigured()) {
      logger.warn('[GHL Messaging] GHL not configured - CRM sync skipped');
      return { contactId: '', success: false, error: 'GHL not configured' };
    }

    try {
      const { upsertContact } = await import('@/lib/ghl/api/contacts');

      const contact = await upsertContact({
        email: params.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        address1: params.address,
        city: params.city,
        state: params.state,
        postalCode: params.postalCode,
        tags: params.tags || ['results-roofing'],
        source: params.source || 'results-roofing-app',
      });

      logger.info('[GHL Messaging] Customer synced to CRM', {
        contactId: contact.id,
        email: params.email,
        phone: params.phone,
      });

      return { contactId: contact.id, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[GHL Messaging] CRM sync failed', { error: errorMessage });
      return { contactId: '', success: false, error: errorMessage };
    }
  },
};

export default ghlMessagingAdapter;
