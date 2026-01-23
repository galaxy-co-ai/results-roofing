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
  Zap,
  ClipboardList,
} from 'lucide-react';
import styles from './layout.module.css';

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
  { id: 'sow', label: 'SOW Tracker', href: '/admin/sow', icon: ClipboardList },
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
      <button type="submit" className={styles.logoutButton}>
        <LogOut size={18} />
        <span>Exit Admin</span>
      </button>
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
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar} aria-label="Admin navigation">
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            <Zap size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>Dev Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={styles.navLink}>
                  <item.icon size={18} className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to Site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
