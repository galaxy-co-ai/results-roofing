'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/utils';
import styles from './PaymentForm.module.css';

// Initialize Stripe outside component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  quoteId: string;
  depositAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Wrapper component that provides Stripe Elements context
 */
export function PaymentForm({ quoteId, depositAmount, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    // Create PaymentIntent on mount
    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        if (data.mockMode) {
          setMockMode(true);
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        onError?.(message);
        logger.error('Failed to create payment intent', err);
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [quoteId, onError]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Preparing secure payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={24} />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (mockMode) {
    // Development mode - show mock payment form
    return <MockPaymentForm quoteId={quoteId} depositAmount={depositAmount} onSuccess={onSuccess} />;
  }

  if (!clientSecret) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={24} />
        <p>Unable to initialize payment. Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#c4a35a', // Sandstone
            colorBackground: '#fefdfb', // Cream
            colorText: '#1a1a1a', // Charcoal
            colorDanger: '#dc2626',
            fontFamily: '"Inter", system-ui, sans-serif',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              border: '1px solid #e2d4b7',
              padding: '12px',
            },
            '.Input:focus': {
              border: '1px solid #c4a35a',
              boxShadow: '0 0 0 2px rgba(196, 163, 90, 0.2)',
            },
            '.Label': {
              fontWeight: '500',
              marginBottom: '8px',
            },
          },
        },
      }}
    >
      <CheckoutForm
        quoteId={quoteId}
        depositAmount={depositAmount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

/**
 * Inner form component with Stripe hooks
 */
function CheckoutForm({ quoteId, depositAmount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/quote/${quoteId}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        // Show error to customer
        const message = submitError.message || 'Payment failed. Please try again.';
        setError(message);
        onError?.(message);
        logger.warn('Payment failed', { code: submitError.code, message });
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded without redirect
        setIsComplete(true);
        onSuccess?.();
        // Navigate to confirmation after a short delay
        setTimeout(() => {
          router.push(`/quote/${quoteId}/confirmation`);
        }, 1500);
      }
    } catch (err) {
      const message = 'An unexpected error occurred. Please try again.';
      setError(message);
      onError?.(message);
      logger.error('Payment error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className={styles.successContainer}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h3>Payment Successful!</h3>
        <p>Redirecting to your confirmation...</p>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(depositAmount);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.paymentElementContainer}>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className={styles.inlineError}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={styles.submitButton}
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            Processing...
          </>
        ) : (
          <>Pay {formattedAmount}</>
        )}
      </button>

      <div className={styles.securityNote}>
        <Lock size={14} />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      <div className={styles.footer}>
        <span>3-day cancellation policy</span>
        <span className={styles.divider}>•</span>
        <span>Powered by Stripe</span>
      </div>
    </form>
  );
}

/**
 * Mock payment form for development when Stripe is not configured
 */
function MockPaymentForm({ quoteId, depositAmount, onSuccess }: PaymentFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleMockPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsComplete(true);
    onSuccess?.();

    setTimeout(() => {
      router.push(`/quote/${quoteId}/confirmation`);
    }, 1500);
  };

  if (isComplete) {
    return (
      <div className={styles.successContainer}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h3>Payment Successful!</h3>
        <p>Redirecting to your confirmation...</p>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(depositAmount);

  return (
    <form onSubmit={handleMockPayment} className={styles.form}>
      <div className={styles.mockBanner}>
        <AlertCircle size={16} />
        <span>Development Mode - Stripe not configured</span>
      </div>

      <div className={styles.paymentElementContainer}>
        <div className={styles.mockInput}>
          <label>Card Number</label>
          <input type="text" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
        </div>
        <div className={styles.mockInputRow}>
          <div className={styles.mockInput}>
            <label>Expiry</label>
            <input type="text" placeholder="MM/YY" defaultValue="12/26" />
          </div>
          <div className={styles.mockInput}>
            <label>CVC</label>
            <input type="text" placeholder="123" defaultValue="123" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className={styles.submitButton}
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className={styles.spinner} />
            Processing...
          </>
        ) : (
          <>Pay {formattedAmount} (Mock)</>
        )}
      </button>

      <div className={styles.securityNote}>
        <Lock size={14} />
        <span>Mock mode - no real payment will be processed</span>
      </div>
    </form>
  );
}

export default PaymentForm;
