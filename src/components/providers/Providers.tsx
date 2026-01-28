'use client';

import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AnalyticsProvider } from './AnalyticsProvider';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * App-wide providers wrapper
 * Includes React Query client, Analytics, and Toast notifications
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
      <ToastProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider gtmId={gtmId}>
            {children}
          </AnalyticsProvider>
        </Suspense>
      </ToastProvider>
    </QueryClientProvider>
  );
}
