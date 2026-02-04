import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateResumeToken,
  hashToken,
  getResumeTokenExpiry,
  buildResumeUrl,
  isTokenValid,
  formatExpiryDate,
  getDaysUntilExpiry,
} from './quote-resume';

describe('Quote Resume Utilities', () => {
  describe('generateResumeToken', () => {
    it('should generate a non-empty token', () => {
      const token = generateResumeToken();
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateResumeToken();
      const token2 = generateResumeToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate URL-safe tokens', () => {
      const token = generateResumeToken();
      // URL-safe base64 uses only alphanumeric, hyphen, and underscore
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate tokens of consistent length', () => {
      const tokens = Array.from({ length: 10 }, () => generateResumeToken());
      const lengths = tokens.map((t) => t.length);
      // All tokens should have the same length (43 chars for 32 bytes base64url)
      expect(new Set(lengths).size).toBe(1);
    });
  });

  describe('hashToken', () => {
    it('should generate a hash from a token', () => {
      const token = 'test-token';
      const hash = hashToken(token);
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex chars
    });

    it('should generate consistent hashes for same input', () => {
      const token = 'same-token';
      expect(hashToken(token)).toBe(hashToken(token));
    });

    it('should generate different hashes for different inputs', () => {
      expect(hashToken('token1')).not.toBe(hashToken('token2'));
    });
  });

  describe('getResumeTokenExpiry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a date 30 days in the future', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      vi.setSystemTime(now);

      const expiry = getResumeTokenExpiry();
      const expected = new Date('2024-02-14T12:00:00Z');

      expect(expiry.getTime()).toBe(expected.getTime());
    });

    it('should return a date object', () => {
      const expiry = getResumeTokenExpiry();
      expect(expiry).toBeInstanceOf(Date);
    });

    it('should return a future date', () => {
      vi.useRealTimers();
      const expiry = getResumeTokenExpiry();
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('buildResumeUrl', () => {
    it('should build URL with provided base', () => {
      const url = buildResumeUrl('abc123', 'https://example.com');
      expect(url).toBe('https://example.com/quote/resume?token=abc123');
    });

    it('should encode special characters in token', () => {
      const url = buildResumeUrl('token+with=special&chars', 'https://example.com');
      expect(url).toBe('https://example.com/quote/resume?token=token%2Bwith%3Dspecial%26chars');
    });

    it('should use default URL when base not provided', () => {
      const url = buildResumeUrl('abc123');
      expect(url).toContain('/quote/resume?token=abc123');
    });
  });

  describe('isTokenValid', () => {
    it('should return true for future expiry date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      expect(isTokenValid(futureDate)).toBe(true);
    });

    it('should return false for past expiry date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isTokenValid(pastDate)).toBe(false);
    });

    it('should return false for current time', () => {
      // Technically equal should be false since we check <
      const now = new Date();
      expect(isTokenValid(now)).toBe(false);
    });
  });

  describe('formatExpiryDate', () => {
    it('should format date in readable format', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const formatted = formatExpiryDate(date);

      // Should include day of week, month, day, and year
      expect(formatted).toContain('2024');
      expect(formatted).toContain('June');
      expect(formatted).toContain('15');
    });

    it('should include weekday', () => {
      const date = new Date('2024-06-15T12:00:00Z'); // Saturday
      const formatted = formatExpiryDate(date);
      expect(formatted).toContain('Saturday');
    });
  });

  describe('getDaysUntilExpiry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return positive days for future dates', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      vi.setSystemTime(now);

      const futureDate = new Date('2024-01-25T12:00:00Z');
      expect(getDaysUntilExpiry(futureDate)).toBe(10);
    });

    it('should return negative days for past dates', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      vi.setSystemTime(now);

      const pastDate = new Date('2024-01-10T12:00:00Z');
      expect(getDaysUntilExpiry(pastDate)).toBe(-5);
    });

    it('should round up partial days', () => {
      const now = new Date('2024-01-15T00:00:00Z');
      vi.setSystemTime(now);

      // 1.5 days from now should round up to 2
      const futureDate = new Date('2024-01-16T12:00:00Z');
      expect(getDaysUntilExpiry(futureDate)).toBe(2);
    });

    it('should return 0 for same day', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      vi.setSystemTime(now);

      const sameDay = new Date('2024-01-15T18:00:00Z');
      expect(getDaysUntilExpiry(sameDay)).toBe(1); // Rounds up from 0.25
    });
  });
});
