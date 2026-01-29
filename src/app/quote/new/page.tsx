import { redirect } from 'next/navigation';

/**
 * /quote/new now redirects to the landing page.
 * Users enter their address on the landing page, which creates
 * the quote and redirects directly to package selection.
 */
export default function NewQuotePage() {
  redirect('/');
}
