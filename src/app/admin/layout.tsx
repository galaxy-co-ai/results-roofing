import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  ListTodo, 
  FileText,
  LogOut,
  ClipboardList,
  Database,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin',
  },
  description: 'Development admin dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

// Force dynamic to check auth on each request
export const dynamic = 'force-dynamic';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { id: 'database', label: 'Database', href: '/admin/database', icon: Database },
  { id: 'sow', label: 'SOW Tracker', href: '/admin/sow', icon: ClipboardList },
  { id: 'changelog', label: 'Changelog', href: '/admin/changelog', icon: History },
  { id: 'feedback', label: 'Feedback', href: '/admin/feedback', icon: MessageSquareText },
  { id: 'tasks', label: 'Tasks', href: '/admin/tasks', icon: ListTodo },
  { id: 'notes', label: 'Notes', href: '/admin/notes', icon: FileText },
];

async function LogoutButton() {
  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/');
  }

  return (
    <form action={handleLogout}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
        <LogOut size={16} />
        <span>Exit Admin</span>
      </Button>
    </form>
  );
}

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
        {/* Sidebar */}
        <aside className="flex w-48 flex-col border-r bg-background" aria-label="Admin navigation">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="flex items-center">
            <img
              src="/brand/logos/light/logo-horizontal.png"
              alt="Results Roofing"
              style={{ height: '28px', width: 'auto' }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            ← Back to Site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
