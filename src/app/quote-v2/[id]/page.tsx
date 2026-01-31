'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WizardProvider, WizardShell } from '@/components/features/quote-v2';
import type { WizardContextType } from '@/components/features/quote-v2';
import { Loader2 } from 'lucide-react';

/**
 * Quote Wizard V2 - Resume existing quote
 *
 * Fetches the quote data and initializes the wizard at the appropriate state.
 */
export default function QuoteV2ResumePage() {
  const params = useParams();
  const quoteId = params.id as string;

  const [initialContext, setInitialContext] = useState<Partial<WizardContextType> | null>(null);
  const [initialState, setInitialState] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuote() {
      try {
        // Try to load checkpoint first
        const checkpointRes = await fetch(`/api/quote-v2/${quoteId}/checkpoint`);

        if (checkpointRes.ok) {
          const checkpoint = await checkpointRes.json();
          setInitialContext(checkpoint.context);
          setInitialState(checkpoint.state);
        } else {
          // Fallback: Load quote data directly
          const quoteRes = await fetch(`/api/quotes?id=${quoteId}`);

          if (!quoteRes.ok) {
            throw new Error('Quote not found');
          }

          const quote = await quoteRes.json();

          // Build context from quote data
          const context: Partial<WizardContextType> = {
            quoteId: quote.id,
            address: {
              streetAddress: quote.address?.street || '',
              city: quote.address?.city || '',
              state: quote.address?.state || '',
              zip: quote.address?.zip || '',
              formattedAddress: `${quote.address?.street}, ${quote.address?.city}, ${quote.address?.state} ${quote.address?.zip}`,
              lat: quote.location?.lat || 0,
              lng: quote.location?.lng || 0,
              placeId: quote.location?.placeId || '',
            },
            propertyConfirmed: true,
            sqftEstimate: quote.estimate?.sqft || null,
            priceRanges: quote.estimate?.tiers || null,
          };

          // Determine starting state based on quote status
          let state = 'confirm';
          if (quote.selectedTier) {
            context.selectedTier = quote.selectedTier.tier;
            context.selectedTierId = quote.selectedTier.tierId;
            state = 'schedule';
          }
          if (quote.scheduledDate) {
            context.scheduledDate = new Date(quote.scheduledDate);
            context.timeSlot = quote.timeSlot;
            state = 'contact';
          }
          if (quote.phone) {
            context.phone = quote.phone;
            context.email = quote.email || '';
            context.smsConsent = quote.smsConsent || false;
            state = 'payment';
          }
          if (quote.status === 'paid' || quote.status === 'completed') {
            state = 'success';
          }

          setInitialContext(context);
          setInitialState(state);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quote');
      } finally {
        setIsLoading(false);
      }
    }

    loadQuote();
  }, [quoteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-sandstone mx-auto" />
          <p className="mt-4 text-gray-600">Loading your quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-xl font-bold text-charcoal mb-2">Quote Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/quote-v2"
            className="inline-block px-4 py-2 bg-sandstone text-white rounded-lg hover:bg-sandstone-dark transition-colors"
          >
            Start New Quote
          </a>
        </div>
      </div>
    );
  }

  return (
    <WizardProvider
      quoteId={quoteId}
      initialContext={initialContext || undefined}
      initialState={initialState}
    >
      <WizardShell />
    </WizardProvider>
  );
}
