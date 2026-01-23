'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

/**
 * Hook that returns user data, with dev bypass support
 * When NEXT_PUBLIC_BYPASS_CLERK=true, returns mock user data
 */
export function useDevUser() {
  const clerkResult = useClerkUser();

  // In dev bypass mode, return mock user
  if (DEV_BYPASS_ENABLED) {
    return {
      user: MOCK_USER,
      isLoaded: true,
      isSignedIn: true,
    };
  }

  return clerkResult;
}
