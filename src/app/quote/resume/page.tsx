import { redirect } from 'next/navigation';
import { db, schema, eq } from '@/db/index';
import { isTokenValid } from '@/lib/quote-resume';
import { ResumeError } from './ResumeError';

interface ResumePageProps {
  searchParams: Promise<{ token?: string }>;
}

/**
 * Resume Quote Page
 * Validates the resume token and redirects to the appropriate step
 */
export default async function ResumePage({ searchParams }: ResumePageProps) {
  const { token } = await searchParams;

  // No token provided
  if (!token) {
    return (
      <ResumeError
        title="Invalid Link"
        message="This resume link is missing required information. Please use the link from your email."
      />
    );
  }

  // Look up the draft
  const draft = await db.query.quoteDrafts.findFirst({
    where: eq(schema.quoteDrafts.resumeToken, token),
  });

  if (!draft) {
    return (
      <ResumeError
        title="Link Not Found"
        message="This resume link is invalid or has already been used. Please start a new quote."
        showNewQuoteButton
      />
    );
  }

  // Check expiration
  if (!isTokenValid(draft.expiresAt)) {
    return (
      <ResumeError
        title="Link Expired"
        message="This resume link has expired. Quote links are valid for 30 days. Please start a new quote for current pricing."
        showNewQuoteButton
      />
    );
  }

  // Fetch the quote
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, draft.quoteId),
  });

  if (!quote) {
    return (
      <ResumeError
        title="Quote Not Found"
        message="The quote associated with this link no longer exists. Please start a new quote."
        showNewQuoteButton
      />
    );
  }

  // Check if quote has expired
  if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
    return (
      <ResumeError
        title="Quote Expired"
        message="Your quote has expired. Material prices may have changed. Please start a new quote for current pricing."
        showNewQuoteButton
      />
    );
  }

  // Determine redirect based on quote state
  const draftState = draft.draftState as { currentStage?: number; selectedTier?: string };
  let redirectPath: string;

  if (quote.selectedTier) {
    // If tier already selected, go to checkout
    redirectPath = `/quote/${quote.id}/checkout`;
  } else if (quote.status === 'measured' || quote.sqftTotal) {
    // If measured, go to package selection
    redirectPath = `/quote/${quote.id}/packages`;
  } else if (draftState.currentStage === 2) {
    redirectPath = `/quote/${quote.id}/packages`;
  } else if (draftState.currentStage === 3) {
    redirectPath = `/quote/${quote.id}/checkout`;
  } else {
    // Default to packages
    redirectPath = `/quote/${quote.id}/packages`;
  }

  // Redirect to the appropriate page
  redirect(redirectPath);
}
