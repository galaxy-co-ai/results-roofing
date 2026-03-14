import { redirect } from 'next/navigation';

/**
 * Legacy /portal/dashboard route — permanently redirect to /portal
 * The portal home page at /portal now handles all dashboard functionality.
 */
export default function DashboardRedirect() {
  redirect('/portal');
}
