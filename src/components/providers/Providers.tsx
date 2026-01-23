'use client';

import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AnalyticsProvider } from './AnalyticsProvider';

/**
 * App-wide providers wrapper
 * Includes React Query client and Analytics
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient instance that persists across renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // GTM container ID from environment
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <AnalyticsProvider gtmId={gtmId}>
          {children}
        </AnalyticsProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
