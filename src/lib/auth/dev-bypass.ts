/**
 * Development authentication bypass
 * Provides mock user data when BYPASS_CLERK=true
 * WARNING: Never use in production!
 */

export const DEV_BYPASS_ENABLED = 
  process.env.NODE_ENV === 'development' && 
  process.env.NEXT_PUBLIC_BYPASS_CLERK === 'true';

/**
 * Mock user data for development
 */
export const MOCK_USER = {
  id: 'dev_user_123',
  firstName: 'Dev',
  lastName: 'User',
  fullName: 'Dev User',
  primaryEmailAddress: {
    emailAddress: 'dev@example.com',
  },
  imageUrl: null,
} as const;

/**
 * Mock session for development
 */
export const MOCK_SESSION = {
  id: 'dev_session_123',
  status: 'active',
  userId: MOCK_USER.id,
} as const;
