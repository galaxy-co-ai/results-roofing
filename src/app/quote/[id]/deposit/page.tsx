import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface DepositPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Deposit page now redirects to Confirm page
 * Deposit collection has been moved to the customer portal
 */
export default async function DepositPage({ params }: DepositPageProps) {
  const { id: quoteId } = await params;

  // Redirect to the new confirm page
  redirect(`/quote/${quoteId}/confirm`);
}
