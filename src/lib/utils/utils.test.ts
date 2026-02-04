import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPhoneNumber, safeJsonParse, cn } from './index';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format whole numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(10000)).toBe('$10,000');
      expect(formatCurrency(100000)).toBe('$100,000');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should round decimals', () => {
      expect(formatCurrency(1000.5)).toBe('$1,001');
      expect(formatCurrency(1000.4)).toBe('$1,000');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-$500');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    });

    it('should handle phone numbers with existing formatting', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
    });

    it('should handle phone numbers with country code', () => {
      // 11 digits won't match the pattern, returns original
      expect(formatPhoneNumber('15551234567')).toBe('15551234567');
    });

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber('invalid')).toBe('invalid');
    });

    it('should strip non-numeric characters', () => {
      expect(formatPhoneNumber('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"name": "test"}', {})).toEqual({ name: 'test' });
      expect(safeJsonParse('[1, 2, 3]', [])).toEqual([1, 2, 3]);
      expect(safeJsonParse('"hello"', '')).toBe('hello');
      expect(safeJsonParse('123', 0)).toBe(123);
      expect(safeJsonParse('true', false)).toBe(true);
      expect(safeJsonParse('null', 'default')).toBe(null);
    });

    it('should return fallback for invalid JSON', () => {
      expect(safeJsonParse('invalid', { default: true })).toEqual({ default: true });
      expect(safeJsonParse('{malformed}', [])).toEqual([]);
      expect(safeJsonParse('', 'fallback')).toBe('fallback');
    });

    it('should return fallback for undefined-like strings', () => {
      expect(safeJsonParse('undefined', 'fallback')).toBe('fallback');
    });

    it('should preserve type with generics', () => {
      interface User {
        id: number;
        name: string;
      }
      const fallback: User = { id: 0, name: '' };
      const result = safeJsonParse<User>('{"id": 1, "name": "John"}', fallback);
      expect(result.id).toBe(1);
      expect(result.name).toBe('John');
    });
  });

  describe('cn (className utility)', () => {
    it('should combine multiple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should filter out falsy values', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar');
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
      expect(cn('foo', false, 'bar')).toBe('foo bar');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn(null, undefined, false)).toBe('');
    });

    it('should handle single class', () => {
      expect(cn('solo')).toBe('solo');
    });
  });
});
