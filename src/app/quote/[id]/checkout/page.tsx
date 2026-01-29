import { redirect } from 'next/navigation';

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Legacy checkout page - redirects to the new schedule page
 * Payment is now handled from the user dashboard after scheduling
 */
export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id: quoteId } = await params;
  
  // Redirect to the new schedule page
  redirect(`/quote/${quoteId}/schedule`);
}
