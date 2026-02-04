'use client';

import { ClerkProvider } from '@clerk/nextjs';

/**
 * Auth Layout - Wraps sign-in/sign-up pages with ClerkProvider
 * Clerk JS only loads on these routes, not on homepage/quote pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
