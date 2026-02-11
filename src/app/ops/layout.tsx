import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import { OpsLayoutClient } from './OpsLayoutClient';
import { OpsLogin } from './OpsLogin';
import '@/styles/ops-tokens.css';
import '@/styles/ops-shadcn-bridge.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

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

  const fontClasses = `${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`;

  return <OpsLayoutClient fontClasses={fontClasses}>{children}</OpsLayoutClient>;
}
