/**
 * Quote Resume Utilities
 * Handles token generation and URL construction for save/resume functionality
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Configuration for resume tokens
 */
const RESUME_TOKEN_LENGTH = 32; // 32 bytes = 64 hex chars
const RESUME_LINK_EXPIRY_DAYS = 30;

/**
 * Generates a cryptographically secure resume token
 * URL-safe base64 encoding for use in URLs
 */
export function generateResumeToken(): string {
  const buffer = randomBytes(RESUME_TOKEN_LENGTH);
  // Use URL-safe base64 encoding
  return buffer.toString('base64url');
}

/**
 * Generates a hash of the token for lookup (if needed for extra security)
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Calculates the expiration date for a resume link
 */
export function getResumeTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + RESUME_LINK_EXPIRY_DAYS);
  return expiry;
}

/**
 * Constructs the full resume URL
 */
export function buildResumeUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://resultsroofing.com';
  return `${base}/quote/resume?token=${encodeURIComponent(token)}`;
}

/**
 * Validates that a token hasn't expired
 */
export function isTokenValid(expiresAt: Date): boolean {
  return new Date() < expiresAt;
}

/**
 * Formats expiry date for display in emails
 */
export function formatExpiryDate(expiresAt: Date): string {
  return expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Gets the number of days until expiry
 */
export function getDaysUntilExpiry(expiresAt: Date): number {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
