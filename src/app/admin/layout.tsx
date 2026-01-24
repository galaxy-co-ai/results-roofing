import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Results Roofing Admin',
  },
  description: 'Results Roofing development admin dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

// Force dynamic to check auth on each request
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin authentication
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_session')?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;

  // If no token at all, redirect
  if (!adminToken) {
    redirect('/');
  }

  // If expected token is set, verify it matches
  if (expectedToken && adminToken !== expectedToken) {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
