import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the logger
vi.mock('@/lib/utils', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { ghlMessagingAdapter } from './ghl-messaging';

describe('GHL Messaging Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return false when GHL is not configured', () => {
      // Since env vars are not set in test, should return false
      expect(ghlMessagingAdapter.isConfigured()).toBe(false);
    });
  });

  describe('sendSms (mock mode)', () => {
    it('should return mock response when not configured', async () => {
      const result = await ghlMessagingAdapter.sendSms({
        contactId: 'contact-id',
        message: 'Test message',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
      expect(result.id).toContain('mock-');
    });
  });

  describe('sendSmsByPhone (mock mode)', () => {
    it('should return mock response when not configured', async () => {
      const result = await ghlMessagingAdapter.sendSmsByPhone('+15551234567', 'Test message');

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });
  });

  describe('sendEmail (mock mode)', () => {
    it('should return mock response when not configured', async () => {
      const result = await ghlMessagingAdapter.sendEmail({
        contactId: 'contact-id',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });
  });

  describe('syncCustomerToCRM (mock mode)', () => {
    it('should return error when not configured', async () => {
      const result = await ghlMessagingAdapter.syncCustomerToCRM({
        email: 'test@example.com',
        phone: '+15551234567',
        firstName: 'John',
        lastName: 'Doe',
        tags: ['quote'],
      });

      // When not configured, returns error (not a mock success)
      expect(result.success).toBe(false);
      expect(result.error).toBe('GHL not configured');
    });
  });

  describe('Template message functions (mock mode)', () => {
    it('sendQuoteReadySms should return mock response', async () => {
      const result = await ghlMessagingAdapter.sendQuoteReadySms(
        '+15551234567',
        'https://example.com/quote/123'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });

    it('sendBookingConfirmationSms should return mock response', async () => {
      const result = await ghlMessagingAdapter.sendBookingConfirmationSms(
        '+15551234567',
        'January 15, 2026'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });

    it('sendBookingReminderSms should return mock response', async () => {
      const result = await ghlMessagingAdapter.sendBookingReminderSms(
        '+15551234567',
        'January 15, 2026'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });

    it('sendPaymentConfirmationSms should return mock response', async () => {
      const result = await ghlMessagingAdapter.sendPaymentConfirmationSms(
        '+15551234567',
        '$500.00'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });

    it('sendContractSignedSms should return mock response', async () => {
      const result = await ghlMessagingAdapter.sendContractSignedSms('+15551234567');

      expect(result.success).toBe(true);
      expect(result.status).toBe('mock');
    });
  });
});
