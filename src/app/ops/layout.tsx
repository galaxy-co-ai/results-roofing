import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { OpsSidebar } from './OpsSidebar';
import { OpsLogin } from './OpsLogin';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Operations Dashboard',
    template: '%s | Results Roofing Ops',
  },
  description: 'Results Roofing operations dashboard - CRM, Messaging, Support, and Analytics',
  robots: {
    index: false,
    follow: false,
  },
};

// Force dynamic to check auth on each request
export const dynamic = 'force-dynamic';

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  // Check ops authentication (separate from admin)
  const cookieStore = await cookies();
  const opsToken = cookieStore.get('ops_session')?.value;
  const expectedToken = process.env.OPS_SESSION_TOKEN;

  // Check authentication
  const isAuthenticated = opsToken && (!expectedToken || opsToken === expectedToken);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <OpsLogin />;
  }

  return (
    <div className="flex h-screen bg-background">
      <OpsSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6 max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
