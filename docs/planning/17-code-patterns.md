# 17 - Code Patterns

This document defines the code patterns and conventions for the Results Roofing website. All patterns use the project's specific tech stack and should be followed consistently throughout development.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Neon PostgreSQL, Drizzle ORM, Clerk Auth, Ark UI, React Hook Form + Zod, TanStack Query, CSS Modules with `--rr-*` design tokens.

---

## How to Use This Document

This is the **convergence point** document - all implementation patterns flow from here. When writing code:

1. **Check this document first** for the established pattern
2. **Follow patterns exactly** unless there's a documented exception
3. **Propose updates** if a better pattern emerges during development

**Related Documents:**
- `06-component-specs.md` - Component APIs and specifications
- `08-data-models.md` - Database schemas and relationships
- `09-api-contracts.md` - API endpoints and Server Actions
- `15-file-architecture.md` - File organization and naming
- `16-design-tokens.md` - CSS custom properties system

---

## Component Patterns

### Server Components vs Client Components

Next.js 14 App Router defaults to Server Components. Use Client Components only when necessary.

**Server Components (Default):**
- Data fetching
- Direct database access
- Accessing backend resources
- Keeping sensitive data on server
- Large dependencies (stay off client bundle)

**Client Components (`'use client'`):**
- Interactivity (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, useContext)
- Ark UI interactive components

```typescript
// src/components/features/quote/QuoteSummary.tsx
// Server Component - fetches data, no interactivity

import { getQuoteById } from '@/lib/db/queries/quotes';
import { QuoteSummaryCard } from './QuoteSummaryCard';

interface QuoteSummaryProps {
  quoteId: string;
}

export async function QuoteSummary({ quoteId }: QuoteSummaryProps) {
  const quote = await getQuoteById(quoteId);

  if (!quote) {
    return <div className="quote-summary--empty">Quote not found</div>;
  }

  return <QuoteSummaryCard quote={quote} />;
}
```

```typescript
// src/components/features/quote/QuoteSummaryCard.tsx
'use client';

// Client Component - has interactivity

import { useState } from 'react';
import styles from './QuoteSummaryCard.module.css';
import type { Quote } from '@/lib/db/schema';

interface QuoteSummaryCardProps {
  quote: Quote;
}

export function QuoteSummaryCard({ quote }: QuoteSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{quote.projectType}</h3>
      <button
        className={styles.toggle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      {isExpanded && (
        <div className={styles.details}>
          {/* Quote details */}
        </div>
      )}
    </div>
  );
}
```

### Ark UI Component Integration

Ark UI provides headless, accessible components. We wrap them with our design tokens and styling.

**Pattern: Ark UI Wrapper Component**

```typescript
// src/components/ui/Button/Button.tsx
'use client';

import { forwardRef } from 'react';
import { ark } from '@ark-ui/react';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <ark.button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {!isLoading && leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
        <span className={styles.label}>{children}</span>
        {!isLoading && rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
      </ark.button>
    );
  }
);
```

```typescript
// src/components/ui/Button/Button.types.ts
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

```css
/* src/components/ui/Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rr-space-2);
  font-family: var(--rr-font-family-primary);
  font-weight: var(--rr-font-weight-semibold);
  border-radius: var(--rr-radius-md);
  cursor: pointer;
  transition: all var(--rr-duration-normal) var(--rr-easing-default);
}

.button:focus-visible {
  outline: var(--rr-border-width-md) solid var(--rr-color-focus-ring);
  outline-offset: var(--rr-space-0-5);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background-color: var(--rr-color-primary);
  color: var(--rr-color-text-inverse);
  border: none;
}

.primary:hover:not(:disabled) {
  background-color: var(--rr-color-primary-hover);
}

.secondary {
  background-color: var(--rr-color-secondary);
  color: var(--rr-color-text-inverse);
  border: none;
}

.outline {
  background-color: transparent;
  color: var(--rr-color-primary);
  border: var(--rr-border-width-sm) solid var(--rr-color-primary);
}

.ghost {
  background-color: transparent;
  color: var(--rr-color-text-primary);
  border: none;
}

.danger {
  background-color: var(--rr-color-error);
  color: var(--rr-color-text-inverse);
  border: none;
}

/* Sizes - from design tokens */
.sm {
  height: 36px;
  padding: 0 var(--rr-space-3);
  font-size: var(--rr-font-size-sm);
}

.md {
  height: 44px;
  padding: 0 var(--rr-space-4);
  font-size: var(--rr-font-size-base);
}

.lg {
  height: 52px;
  padding: 0 var(--rr-space-6);
  font-size: var(--rr-font-size-lg);
}

/* Loading spinner */
.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin var(--rr-duration-slow) linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Pattern: Ark UI Dialog (Modal)**

```typescript
// src/components/ui/Modal/Modal.tsx
'use client';

import { Dialog, Portal } from '@ark-ui/react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
import type { ModalProps } from './Modal.types';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Positioner className={styles.positioner}>
          <Dialog.Content className={`${styles.content} ${styles[size]}`}>
            <div className={styles.header}>
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              <Dialog.CloseTrigger className={styles.closeButton}>
                <X size={20} aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Dialog.CloseTrigger>
            </div>
            {description && (
              <Dialog.Description className={styles.description}>
                {description}
              </Dialog.Description>
            )}
            <div className={styles.body}>{children}</div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
```

### Component Composition Pattern

Use composition for flexible, reusable components.

```typescript
// src/components/ui/Card/Card.tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import styles from './Card.module.css';

interface CardContextValue {
  variant: 'default' | 'elevated' | 'outlined';
}

const CardContext = createContext<CardContextValue>({ variant: 'default' });

interface CardProps {
  children: ReactNode;
  variant?: CardContextValue['variant'];
  className?: string;
}

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`${styles.card} ${styles[variant]} ${className || ''}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.header} ${className || ''}`}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={`${styles.title} ${className || ''}`}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`${styles.description} ${className || ''}`}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.content} ${className || ''}`}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>;
}

// Usage:
// <Card variant="elevated">
//   <CardHeader>
//     <CardTitle>Package Options</CardTitle>
//     <CardDescription>Select your preferred roofing package</CardDescription>
//   </CardHeader>
//   <CardContent>...</CardContent>
//   <CardFooter>...</CardFooter>
// </Card>
```

### Props Pattern with Discriminated Unions

Use discriminated unions for components with mutually exclusive states.

```typescript
// src/components/ui/Alert/Alert.types.ts
import type { ReactNode } from 'react';

type AlertBase = {
  title?: string;
  children: ReactNode;
  onClose?: () => void;
};

type AlertSuccess = AlertBase & {
  variant: 'success';
  action?: { label: string; onClick: () => void };
};

type AlertError = AlertBase & {
  variant: 'error';
  retryAction?: () => void;
};

type AlertWarning = AlertBase & {
  variant: 'warning';
};

type AlertInfo = AlertBase & {
  variant: 'info';
  learnMoreUrl?: string;
};

export type AlertProps = AlertSuccess | AlertError | AlertWarning | AlertInfo;
```

---

## State Management Patterns

### TanStack Query for Server State

Use TanStack Query for all server data fetching in Client Components.

**Query Keys Convention:**

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  // Quotes
  quotes: {
    all: ['quotes'] as const,
    detail: (id: string) => ['quotes', id] as const,
    bySession: (sessionId: string) => ['quotes', 'session', sessionId] as const,
  },

  // Leads
  leads: {
    all: ['leads'] as const,
    detail: (id: string) => ['leads', id] as const,
    byStatus: (status: string) => ['leads', 'status', status] as const,
  },

  // Appointments
  appointments: {
    all: ['appointments'] as const,
    detail: (id: string) => ['appointments', id] as const,
    available: (date: string) => ['appointments', 'available', date] as const,
  },

  // Portal
  portal: {
    project: (id: string) => ['portal', 'project', id] as const,
    documents: (projectId: string) => ['portal', 'documents', projectId] as const,
    timeline: (projectId: string) => ['portal', 'timeline', projectId] as const,
  },
} as const;
```

**Query Hook Pattern:**

```typescript
// src/hooks/queries/useQuote.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getQuote, updateQuote } from '@/lib/api/quotes';
import type { Quote, UpdateQuoteInput } from '@/lib/db/schema';

export function useQuote(quoteId: string | null) {
  return useQuery({
    queryKey: queryKeys.quotes.detail(quoteId!),
    queryFn: () => getQuote(quoteId!),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteInput }) =>
      updateQuote(id, data),
    onSuccess: (updatedQuote) => {
      // Update the specific quote in cache
      queryClient.setQueryData(
        queryKeys.quotes.detail(updatedQuote.id),
        updatedQuote
      );
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
    },
  });
}
```

**Optimistic Updates Pattern:**

```typescript
// src/hooks/queries/useSelectPackage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { selectPackage } from '@/lib/actions/quote';
import type { Quote, PackageTier } from '@/lib/db/schema';

export function useSelectPackage(quoteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tier: PackageTier) => selectPackage(quoteId, tier),
    onMutate: async (tier) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.quotes.detail(quoteId)
      });

      // Snapshot previous value
      const previousQuote = queryClient.getQueryData<Quote>(
        queryKeys.quotes.detail(quoteId)
      );

      // Optimistically update
      if (previousQuote) {
        queryClient.setQueryData(
          queryKeys.quotes.detail(quoteId),
          { ...previousQuote, selectedTier: tier }
        );
      }

      return { previousQuote };
    },
    onError: (err, tier, context) => {
      // Rollback on error
      if (context?.previousQuote) {
        queryClient.setQueryData(
          queryKeys.quotes.detail(quoteId),
          context.previousQuote
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.quotes.detail(quoteId)
      });
    },
  });
}
```

### React Hook Form for Form State

All forms use React Hook Form with Zod validation.

```typescript
// src/hooks/forms/useAddressForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormData } from '@/lib/validations/address';

export function useAddressForm(defaultValues?: Partial<AddressFormData>) {
  return useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      ...defaultValues,
    },
    mode: 'onBlur', // Validate on blur for better UX
  });
}
```

### React Context for UI State

Use Context sparingly, only for truly global UI state.

```typescript
// src/contexts/QuoteFlowContext.tsx
'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';

// Types
type QuoteFlowStep = 'address' | 'details' | 'packages' | 'contact' | 'confirmation';

interface QuoteFlowState {
  currentStep: QuoteFlowStep;
  completedSteps: QuoteFlowStep[];
  quoteId: string | null;
  sessionId: string;
}

type QuoteFlowAction =
  | { type: 'SET_STEP'; step: QuoteFlowStep }
  | { type: 'COMPLETE_STEP'; step: QuoteFlowStep }
  | { type: 'SET_QUOTE_ID'; quoteId: string }
  | { type: 'RESET' };

// Reducer
function quoteFlowReducer(state: QuoteFlowState, action: QuoteFlowAction): QuoteFlowState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.step])],
      };
    case 'SET_QUOTE_ID':
      return { ...state, quoteId: action.quoteId };
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}

function createInitialState(): QuoteFlowState {
  return {
    currentStep: 'address',
    completedSteps: [],
    quoteId: null,
    sessionId: crypto.randomUUID(),
  };
}

// Context
const QuoteFlowContext = createContext<{
  state: QuoteFlowState;
  dispatch: React.Dispatch<QuoteFlowAction>;
} | null>(null);

// Provider
export function QuoteFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quoteFlowReducer, null, createInitialState);

  return (
    <QuoteFlowContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteFlowContext.Provider>
  );
}

// Hook
export function useQuoteFlow() {
  const context = useContext(QuoteFlowContext);
  if (!context) {
    throw new Error('useQuoteFlow must be used within QuoteFlowProvider');
  }
  return context;
}

// Convenience hooks
export function useQuoteFlowStep() {
  const { state, dispatch } = useQuoteFlow();

  return {
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    goToStep: (step: QuoteFlowStep) => dispatch({ type: 'SET_STEP', step }),
    completeStep: (step: QuoteFlowStep) => dispatch({ type: 'COMPLETE_STEP', step }),
    isStepComplete: (step: QuoteFlowStep) => state.completedSteps.includes(step),
  };
}
```

---

## Data Fetching Patterns

### Server Component Data Fetching

Fetch data directly in Server Components using database queries.

```typescript
// src/app/(portal)/portal/[projectId]/page.tsx
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import { getProjectWithDetails } from '@/lib/db/queries/projects';
import { ProjectDashboard } from '@/components/features/portal/ProjectDashboard';

interface PortalPageProps {
  params: { projectId: string };
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { userId } = auth();

  if (!userId) {
    notFound();
  }

  const project = await getProjectWithDetails(params.projectId, userId);

  if (!project) {
    notFound();
  }

  return <ProjectDashboard project={project} />;
}
```

### Server Actions for Mutations

Use Server Actions for all data mutations.

```typescript
// src/lib/actions/quote.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { quotes, leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createQuoteInputSchema } from '@/lib/validations/quote';
import type { ActionResult } from '@/lib/types/actions';

export async function createQuote(
  input: z.infer<typeof createQuoteInputSchema>
): Promise<ActionResult<{ quoteId: string }>> {
  try {
    // Validate input
    const validated = createQuoteInputSchema.parse(input);

    // Create quote in database
    const [quote] = await db
      .insert(quotes)
      .values({
        sessionId: validated.sessionId,
        address: validated.address,
        roofType: validated.roofType,
        squareFootage: validated.squareFootage,
        // ... other fields
      })
      .returning({ id: quotes.id });

    return {
      success: true,
      data: { quoteId: quote.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.flatten().fieldErrors,
        },
      };
    }

    console.error('Failed to create quote:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create quote. Please try again.',
      },
    };
  }
}

export async function selectPackage(
  quoteId: string,
  tier: 'good' | 'better' | 'best'
): Promise<ActionResult<{ quote: typeof quotes.$inferSelect }>> {
  try {
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        selectedTier: tier,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, quoteId))
      .returning();

    if (!updatedQuote) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Quote not found',
        },
      };
    }

    revalidatePath(`/quote/${quoteId}`);

    return {
      success: true,
      data: { quote: updatedQuote },
    };
  } catch (error) {
    console.error('Failed to select package:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update selection. Please try again.',
      },
    };
  }
}
```

**Using Server Actions in Components:**

```typescript
// src/components/features/quote/PackageSelector.tsx
'use client';

import { useTransition } from 'react';
import { selectPackage } from '@/lib/actions/quote';
import { Button } from '@/components/ui/Button';
import { PackageCard } from './PackageCard';
import styles from './PackageSelector.module.css';
import type { PackageTier, Quote } from '@/lib/db/schema';

interface PackageSelectorProps {
  quote: Quote;
  packages: Array<{
    tier: PackageTier;
    name: string;
    price: number;
    features: string[];
  }>;
}

export function PackageSelector({ quote, packages }: PackageSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleSelect = (tier: PackageTier) => {
    startTransition(async () => {
      const result = await selectPackage(quote.id, tier);

      if (!result.success) {
        // Handle error - show toast notification
        console.error(result.error.message);
      }
    });
  };

  return (
    <div className={styles.grid}>
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.tier}
          package={pkg}
          isSelected={quote.selectedTier === pkg.tier}
          isLoading={isPending}
          onSelect={() => handleSelect(pkg.tier)}
        />
      ))}
    </div>
  );
}
```

### Route Handlers for External APIs

Use Route Handlers for webhook endpoints and external API integrations.

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeAdapter } from '@/lib/integrations/adapters/stripe';
import { handlePaymentSucceeded, handlePaymentFailed } from '@/lib/services/payments';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

---

## Form Handling Patterns

### Zod Schema Definitions

Define validation schemas separately for reuse.

```typescript
// src/lib/validations/quote.ts
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(5, 'Please enter a valid street address'),
  city: z.string().min(2, 'Please enter a city'),
  state: z.string().length(2, 'Please select a state'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
});

export const roofDetailsSchema = z.object({
  roofType: z.enum(['asphalt', 'metal', 'tile', 'flat', 'other'], {
    required_error: 'Please select a roof type',
  }),
  stories: z.number().min(1).max(4),
  approximateAge: z.enum(['0-5', '5-10', '10-20', '20+', 'unknown']),
  hasExistingDamage: z.boolean(),
  damageDescription: z.string().optional(),
}).refine(
  (data) => !data.hasExistingDamage || data.damageDescription,
  {
    message: 'Please describe the damage',
    path: ['damageDescription'],
  }
);

export const contactInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(
    /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    'Please enter a valid phone number'
  ),
  preferredContact: z.enum(['email', 'phone', 'text']),
  marketingConsent: z.boolean(),
});

export const createQuoteInputSchema = z.object({
  sessionId: z.string().uuid(),
  address: addressSchema,
  roofDetails: roofDetailsSchema,
  contactInfo: contactInfoSchema,
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type RoofDetailsFormData = z.infer<typeof roofDetailsSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteInputSchema>;
```

### Form Component Pattern

```typescript
// src/components/features/quote/AddressForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormData } from '@/lib/validations/quote';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { US_STATES } from '@/lib/constants/states';
import styles from './AddressForm.module.css';

interface AddressFormProps {
  defaultValues?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AddressForm({ defaultValues, onSubmit, isLoading }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const pending = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <FormField
        label="Street Address"
        error={errors.street?.message}
        required
      >
        <Input
          {...register('street')}
          placeholder="123 Main Street"
          autoComplete="street-address"
          disabled={pending}
        />
      </FormField>

      <div className={styles.row}>
        <FormField
          label="City"
          error={errors.city?.message}
          required
        >
          <Input
            {...register('city')}
            placeholder="City"
            autoComplete="address-level2"
            disabled={pending}
          />
        </FormField>

        <FormField
          label="State"
          error={errors.state?.message}
          required
        >
          <Select {...register('state')} disabled={pending}>
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="ZIP Code"
          error={errors.zipCode?.message}
          required
        >
          <Input
            {...register('zipCode')}
            placeholder="12345"
            autoComplete="postal-code"
            inputMode="numeric"
            disabled={pending}
          />
        </FormField>
      </div>

      <div className={styles.actions}>
        <Button type="submit" isLoading={pending}>
          Continue
        </Button>
      </div>
    </form>
  );
}
```

### Form Field Component

```typescript
// src/components/ui/FormField/FormField.tsx
'use client';

import { type ReactNode, useId } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={styles.field} data-error={!!error}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>

      <div className={styles.inputWrapper}>
        {children}
      </div>

      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Multi-Step Form Pattern

```typescript
// src/components/features/quote/QuoteWizard.tsx
'use client';

import { useState } from 'react';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { AddressForm } from './AddressForm';
import { RoofDetailsForm } from './RoofDetailsForm';
import { ContactForm } from './ContactForm';
import { PackageSelector } from './PackageSelector';
import { QuoteConfirmation } from './QuoteConfirmation';
import { StepIndicator } from './StepIndicator';
import { createQuote, updateQuoteStep } from '@/lib/actions/quote';
import styles from './QuoteWizard.module.css';

const STEPS = ['address', 'details', 'packages', 'contact', 'confirmation'] as const;

export function QuoteWizard() {
  const { state, dispatch } = useQuoteFlow();
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const handleStepComplete = async (stepData: Record<string, unknown>) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    // Save progress to server
    if (state.quoteId) {
      await updateQuoteStep(state.quoteId, state.currentStep, stepData);
    }

    // Move to next step
    dispatch({ type: 'COMPLETE_STEP', step: state.currentStep });
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex < STEPS.length - 1) {
      dispatch({ type: 'SET_STEP', step: STEPS[currentIndex + 1] });
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'address':
        return (
          <AddressForm
            defaultValues={formData.address as any}
            onSubmit={(data) => handleStepComplete({ address: data })}
          />
        );
      case 'details':
        return (
          <RoofDetailsForm
            defaultValues={formData.roofDetails as any}
            onSubmit={(data) => handleStepComplete({ roofDetails: data })}
          />
        );
      case 'packages':
        return (
          <PackageSelector
            quoteId={state.quoteId!}
            onSelect={(tier) => handleStepComplete({ selectedTier: tier })}
          />
        );
      case 'contact':
        return (
          <ContactForm
            defaultValues={formData.contactInfo as any}
            onSubmit={(data) => handleStepComplete({ contactInfo: data })}
          />
        );
      case 'confirmation':
        return <QuoteConfirmation quoteId={state.quoteId!} />;
    }
  };

  return (
    <div className={styles.wizard}>
      <StepIndicator
        steps={STEPS}
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
      />
      <div className={styles.content}>
        {renderStep()}
      </div>
    </div>
  );
}
```

---

## Styling Patterns

### CSS Module Structure

Each component has a co-located `.module.css` file using design tokens.

```css
/* src/components/features/quote/PackageCard.module.css */

.card {
  display: flex;
  flex-direction: column;
  padding: var(--rr-space-6);
  background-color: var(--rr-color-surface);
  border: var(--rr-border-width-sm) solid var(--rr-color-border);
  border-radius: var(--rr-radius-lg);
  transition: all var(--rr-duration-normal) var(--rr-easing-default);
}

.card:hover {
  border-color: var(--rr-color-primary);
  box-shadow: var(--rr-shadow-md);
}

.card[data-selected="true"] {
  border-color: var(--rr-color-primary);
  border-width: var(--rr-border-width-md);
  background-color: var(--rr-color-primary-subtle);
}

.card[data-recommended="true"] {
  position: relative;
}

.card[data-recommended="true"]::before {
  content: 'Most Popular';
  position: absolute;
  top: calc(var(--rr-space-3) * -1);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--rr-space-1) var(--rr-space-3);
  background-color: var(--rr-color-secondary);
  color: var(--rr-color-text-inverse);
  font-size: var(--rr-font-size-xs);
  font-weight: var(--rr-font-weight-semibold);
  border-radius: var(--rr-radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tierName {
  font-size: var(--rr-font-size-sm);
  font-weight: var(--rr-font-weight-semibold);
  color: var(--rr-color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--rr-space-2);
}

.title {
  font-size: var(--rr-font-size-xl);
  font-weight: var(--rr-font-weight-bold);
  color: var(--rr-color-text-primary);
  margin-bottom: var(--rr-space-4);
}

.price {
  font-size: var(--rr-font-size-3xl);
  font-weight: var(--rr-font-weight-bold);
  color: var(--rr-color-primary);
  margin-bottom: var(--rr-space-1);
}

.priceNote {
  font-size: var(--rr-font-size-sm);
  color: var(--rr-color-text-tertiary);
  margin-bottom: var(--rr-space-6);
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--rr-space-6) 0;
  flex-grow: 1;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: var(--rr-space-2);
  padding: var(--rr-space-2) 0;
  font-size: var(--rr-font-size-sm);
  color: var(--rr-color-text-secondary);
}

.featureIcon {
  flex-shrink: 0;
  color: var(--rr-color-success);
}

.selectButton {
  width: 100%;
  margin-top: auto;
}
```

### Responsive Design Pattern

Mobile-first with breakpoint tokens.

```css
/* src/components/layout/PageHeader.module.css */

.header {
  display: flex;
  flex-direction: column;
  gap: var(--rr-space-4);
  padding: var(--rr-space-6) var(--rr-space-4);
}

.title {
  font-size: var(--rr-font-size-2xl);
  font-weight: var(--rr-font-weight-bold);
  color: var(--rr-color-text-primary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--rr-space-2);
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: var(--rr-space-8) var(--rr-space-6);
  }

  .title {
    font-size: var(--rr-font-size-3xl);
  }

  .actions {
    flex-direction: row;
    gap: var(--rr-space-3);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .header {
    padding: var(--rr-space-8);
  }

  .title {
    font-size: var(--rr-font-size-4xl);
  }
}
```

### Animation Pattern

Use CSS custom properties for consistent animations.

```css
/* src/styles/animations.css - imported in global styles */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(var(--rr-space-4));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(calc(var(--rr-space-4) * -1));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```css
/* Using animations in components */
.modal {
  animation: scaleIn var(--rr-duration-normal) var(--rr-easing-default);
}

.toast {
  animation: slideUp var(--rr-duration-normal) var(--rr-easing-default);
}

.dropdown {
  animation: fadeIn var(--rr-duration-fast) var(--rr-easing-default);
}
```

### Layout Pattern with CSS Grid

```css
/* src/components/layout/Container.module.css */

.container {
  width: 100%;
  max-width: var(--rr-container-max-width, 1280px);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--rr-space-4);
  padding-right: var(--rr-space-4);
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--rr-space-6);
    padding-right: var(--rr-space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--rr-space-8);
    padding-right: var(--rr-space-8);
  }
}

/* Variant sizes */
.sm {
  --rr-container-max-width: 640px;
}

.md {
  --rr-container-max-width: 768px;
}

.lg {
  --rr-container-max-width: 1024px;
}

.xl {
  --rr-container-max-width: 1280px;
}

.full {
  --rr-container-max-width: none;
}
```

```css
/* src/components/layout/Grid.module.css */

.grid {
  display: grid;
  gap: var(--rr-space-4);
}

/* Column configurations */
.cols1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.cols2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cols4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Responsive columns */
@media (min-width: 768px) {
  .mdCols2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mdCols3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mdCols4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lgCols2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lgCols3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lgCols4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* Gap sizes */
.gapSm { gap: var(--rr-space-2); }
.gapMd { gap: var(--rr-space-4); }
.gapLg { gap: var(--rr-space-6); }
.gapXl { gap: var(--rr-space-8); }
```

---

## Database Patterns

### Drizzle ORM Query Patterns

```typescript
// src/lib/db/queries/quotes.ts
import { db } from '@/lib/db';
import { quotes, leads, packages } from '@/lib/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

// Simple query
export async function getQuoteById(id: string) {
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, id))
    .limit(1);

  return quote ?? null;
}

// Query with relations
export async function getQuoteWithLead(quoteId: string) {
  const [result] = await db
    .select({
      quote: quotes,
      lead: leads,
    })
    .from(quotes)
    .leftJoin(leads, eq(quotes.leadId, leads.id))
    .where(eq(quotes.id, quoteId))
    .limit(1);

  return result ?? null;
}

// Query with filtering and pagination
export async function getQuotesByStatus(
  status: string,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const [quotesResult, countResult] = await Promise.all([
    db
      .select()
      .from(quotes)
      .where(eq(quotes.status, status))
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(quotes)
      .where(eq(quotes.status, status)),
  ]);

  return {
    data: quotesResult,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    },
  };
}

// Complex query with multiple conditions
export async function getActiveQuotesForPeriod(startDate: Date, endDate: Date) {
  return db
    .select()
    .from(quotes)
    .where(
      and(
        eq(quotes.status, 'active'),
        gte(quotes.createdAt, startDate),
        sql`${quotes.createdAt} < ${endDate}`
      )
    )
    .orderBy(desc(quotes.createdAt));
}
```

### Transaction Pattern

```typescript
// src/lib/db/transactions/checkout.ts
import { db } from '@/lib/db';
import { quotes, leads, payments, contracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface CheckoutData {
  quoteId: string;
  paymentIntentId: string;
  depositAmount: number;
}

export async function processCheckout(data: CheckoutData) {
  return db.transaction(async (tx) => {
    // 1. Get and validate quote
    const [quote] = await tx
      .select()
      .from(quotes)
      .where(eq(quotes.id, data.quoteId))
      .for('update') // Lock row
      .limit(1);

    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== 'pending') {
      throw new Error('Quote is not in pending status');
    }

    // 2. Create payment record
    const [payment] = await tx
      .insert(payments)
      .values({
        quoteId: data.quoteId,
        stripePaymentIntentId: data.paymentIntentId,
        amount: data.depositAmount,
        type: 'deposit',
        status: 'pending',
      })
      .returning();

    // 3. Update quote status
    await tx
      .update(quotes)
      .set({
        status: 'deposit_pending',
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, data.quoteId));

    // 4. Create contract record
    const [contract] = await tx
      .insert(contracts)
      .values({
        quoteId: data.quoteId,
        status: 'pending_signature',
      })
      .returning();

    return {
      payment,
      contract,
    };
  });
}
```

### Database Migration Pattern

```typescript
// drizzle/migrations/0001_add_financing_fields.ts
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  await db.execute(sql`
    ALTER TABLE quotes
    ADD COLUMN financing_provider VARCHAR(50),
    ADD COLUMN financing_term_months INTEGER,
    ADD COLUMN financing_apr DECIMAL(5,2),
    ADD COLUMN financing_monthly_payment DECIMAL(10,2),
    ADD COLUMN financing_prequalified_at TIMESTAMP WITH TIME ZONE;
  `);

  await db.execute(sql`
    CREATE INDEX idx_quotes_financing_provider
    ON quotes(financing_provider)
    WHERE financing_provider IS NOT NULL;
  `);
}

export async function down(db: PostgresJsDatabase) {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_quotes_financing_provider;
  `);

  await db.execute(sql`
    ALTER TABLE quotes
    DROP COLUMN financing_provider,
    DROP COLUMN financing_term_months,
    DROP COLUMN financing_apr,
    DROP COLUMN financing_monthly_payment,
    DROP COLUMN financing_prequalified_at;
  `);
}
```

---

## Error Handling Patterns

### Error Boundary Component

```typescript
// src/components/shared/ErrorBoundary.tsx
'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              We encountered an unexpected error. Please try again.
            </p>
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Next.js Error Page Pattern

```typescript
// src/app/(quote)/quote/[quoteId]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './error.module.css';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function QuoteErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Quote page error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Unable to Load Quote</h1>
        <p className={styles.message}>
          We couldn't load your quote information. This might be a temporary issue.
        </p>
        {error.digest && (
          <p className={styles.errorId}>Error ID: {error.digest}</p>
        )}
        <div className={styles.actions}>
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Action Result Type Pattern

```typescript
// src/lib/types/actions.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

export interface ActionError {
  code: string;
  message: string;
  details?: Record<string, string[] | string>;
}

// Common error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

// Helper to create error results
export function actionError(
  code: keyof typeof ErrorCodes,
  message: string,
  details?: ActionError['details']
): { success: false; error: ActionError } {
  return {
    success: false,
    error: { code: ErrorCodes[code], message, details },
  };
}

// Helper to create success results
export function actionSuccess<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}
```

### API Error Handler Pattern

```typescript
// src/lib/api/error-handler.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'development'
    ? (error as Error).message
    : 'An unexpected error occurred';

  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 }
  );
}
```

---

## Integration & API Patterns

### Adapter Pattern for External Services

All external service integrations use the adapter pattern for consistent interfaces and easy mocking.

```typescript
// src/lib/integrations/adapters/types.ts
export interface ServiceAdapter<TConfig = unknown> {
  readonly name: string;
  readonly version: string;
  initialize(config: TConfig): Promise<void>;
  healthCheck(): Promise<boolean>;
}

// src/lib/integrations/adapters/roofr/types.ts
export interface RoofrMeasurement {
  id: string;
  address: string;
  totalSquareFeet: number;
  roofFacets: RoofFacet[];
  pitch: number;
  complexity: 'simple' | 'moderate' | 'complex';
  createdAt: Date;
}

export interface RoofFacet {
  id: string;
  area: number;
  pitch: number;
  orientation: string;
}

export interface RoofrAdapter extends ServiceAdapter {
  requestMeasurement(address: string): Promise<{ requestId: string }>;
  getMeasurement(requestId: string): Promise<RoofrMeasurement | null>;
  getMeasurementByAddress(address: string): Promise<RoofrMeasurement | null>;
}
```

```typescript
// src/lib/integrations/adapters/roofr/roofr.adapter.ts
import type { RoofrAdapter, RoofrMeasurement } from './types';

interface RoofrConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
}

export function createRoofrAdapter(): RoofrAdapter {
  let config: RoofrConfig | null = null;

  return {
    name: 'roofr',
    version: '1.0.0',

    async initialize(cfg: RoofrConfig) {
      config = cfg;
    },

    async healthCheck() {
      if (!config) return false;

      try {
        const response = await fetch(`${config.baseUrl}/health`, {
          headers: { 'Authorization': `Bearer ${config.apiKey}` },
        });
        return response.ok;
      } catch {
        return false;
      }
    },

    async requestMeasurement(address: string) {
      if (!config) throw new Error('Roofr adapter not initialized');

      const response = await fetch(`${config.baseUrl}/measurements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(`Roofr API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { requestId: data.id };
    },

    async getMeasurement(requestId: string) {
      if (!config) throw new Error('Roofr adapter not initialized');

      const response = await fetch(`${config.baseUrl}/measurements/${requestId}`, {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Roofr API error: ${response.statusText}`);
      }

      return this.transformMeasurement(await response.json());
    },

    async getMeasurementByAddress(address: string) {
      if (!config) throw new Error('Roofr adapter not initialized');

      const response = await fetch(
        `${config.baseUrl}/measurements?address=${encodeURIComponent(address)}`,
        { headers: { 'Authorization': `Bearer ${config.apiKey}` } }
      );

      if (!response.ok) {
        throw new Error(`Roofr API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.measurements[0] ? this.transformMeasurement(data.measurements[0]) : null;
    },

    transformMeasurement(raw: any): RoofrMeasurement {
      return {
        id: raw.id,
        address: raw.property_address,
        totalSquareFeet: raw.total_area_sq_ft,
        roofFacets: raw.facets.map((f: any) => ({
          id: f.id,
          area: f.area_sq_ft,
          pitch: f.pitch,
          orientation: f.orientation,
        })),
        pitch: raw.primary_pitch,
        complexity: raw.complexity_rating,
        createdAt: new Date(raw.created_at),
      };
    },
  };
}
```

### Adapter Registry Pattern

```typescript
// src/lib/integrations/registry.ts
import { createRoofrAdapter } from './adapters/roofr';
import { createStripeAdapter } from './adapters/stripe';
import { createCalAdapter } from './adapters/cal';
import { createResendAdapter } from './adapters/resend';

type AdapterName = 'roofr' | 'stripe' | 'cal' | 'resend';

const adapters = {
  roofr: createRoofrAdapter(),
  stripe: createStripeAdapter(),
  cal: createCalAdapter(),
  resend: createResendAdapter(),
};

let initialized = false;

export async function initializeAdapters() {
  if (initialized) return;

  await Promise.all([
    adapters.roofr.initialize({
      apiKey: process.env.ROOFR_API_KEY!,
      baseUrl: process.env.ROOFR_BASE_URL!,
      webhookSecret: process.env.ROOFR_WEBHOOK_SECRET!,
    }),
    adapters.stripe.initialize({
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    }),
    adapters.cal.initialize({
      apiKey: process.env.CAL_API_KEY!,
      baseUrl: process.env.CAL_BASE_URL!,
    }),
    adapters.resend.initialize({
      apiKey: process.env.RESEND_API_KEY!,
    }),
  ]);

  initialized = true;
}

export function getAdapter<T extends AdapterName>(name: T): typeof adapters[T] {
  if (!initialized) {
    throw new Error('Adapters not initialized. Call initializeAdapters() first.');
  }
  return adapters[name];
}
```

### Webhook Handler Pattern

```typescript
// src/lib/webhooks/handler.ts
import { type NextRequest } from 'next/server';
import crypto from 'crypto';

export interface WebhookConfig {
  secret: string;
  signatureHeader: string;
  signatureScheme: 'hmac-sha256' | 'stripe' | 'custom';
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  config: WebhookConfig
): boolean {
  if (config.signatureScheme === 'hmac-sha256') {
    const expected = crypto
      .createHmac('sha256', config.secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  // Add other schemes as needed
  return false;
}

export function createWebhookHandler<TEvent>(
  config: WebhookConfig,
  handlers: Record<string, (event: TEvent) => Promise<void>>
) {
  return async (request: NextRequest) => {
    const payload = await request.text();
    const signature = request.headers.get(config.signatureHeader);

    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    if (!verifyWebhookSignature(payload, signature, config)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(payload) as TEvent & { type: string };
    const handler = handlers[event.type];

    if (handler) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Webhook handler error for ${event.type}:`, error);
        return new Response('Handler error', { status: 500 });
      }
    }

    return new Response('OK', { status: 200 });
  };
}
```

---

## Testing Patterns

### Unit Test Pattern (Vitest)

```typescript
// src/lib/utils/format-currency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyRange } from './format-currency';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(123.456)).toBe('$123.46');
    expect(formatCurrency(123.454)).toBe('$123.45');
  });
});

describe('formatCurrencyRange', () => {
  it('formats a range correctly', () => {
    expect(formatCurrencyRange(1000, 2000)).toBe('$1,000 - $2,000');
  });

  it('returns single value when min equals max', () => {
    expect(formatCurrencyRange(1500, 1500)).toBe('$1,500');
  });
});
```

### Component Test Pattern (Testing Library)

```typescript
// src/components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('secondary');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('lg');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });
});
```

### Hook Test Pattern

```typescript
// src/hooks/queries/useQuote.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuote } from './useQuote';
import * as quotesApi from '@/lib/api/quotes';

vi.mock('@/lib/api/quotes');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches quote when id is provided', async () => {
    const mockQuote = { id: '123', status: 'pending' };
    vi.mocked(quotesApi.getQuote).mockResolvedValue(mockQuote);

    const { result } = renderHook(() => useQuote('123'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockQuote);
    expect(quotesApi.getQuote).toHaveBeenCalledWith('123');
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useQuote(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(quotesApi.getQuote).not.toHaveBeenCalled();
  });
});
```

### Server Action Test Pattern

```typescript
// src/lib/actions/quote.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQuote, selectPackage } from './quote';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

describe('createQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a quote with valid input', async () => {
    const mockQuote = { id: 'quote-123' };
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockQuote]),
      }),
    } as any);

    const input = {
      sessionId: 'session-123',
      address: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      roofDetails: {
        roofType: 'asphalt' as const,
        stories: 2,
        approximateAge: '10-20' as const,
        hasExistingDamage: false,
      },
      contactInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '512-555-1234',
        preferredContact: 'email' as const,
        marketingConsent: true,
      },
    };

    const result = await createQuote(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quoteId).toBe('quote-123');
    }
  });

  it('returns validation error for invalid input', async () => {
    const input = {
      sessionId: 'not-a-uuid',
      address: { street: '', city: '', state: '', zipCode: 'invalid' },
    };

    const result = await createQuote(input as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });
});
```

### E2E Test Pattern (Playwright)

```typescript
// e2e/quote-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quote Flow', () => {
  test('completes quote request successfully', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Click CTA to start quote
    await page.click('text=Get Your Free Quote');
    await expect(page).toHaveURL(/\/quote/);

    // Step 1: Enter address
    await page.fill('[name="street"]', '123 Test Street');
    await page.fill('[name="city"]', 'Austin');
    await page.selectOption('[name="state"]', 'TX');
    await page.fill('[name="zipCode"]', '78701');
    await page.click('button:has-text("Continue")');

    // Step 2: Roof details
    await page.selectOption('[name="roofType"]', 'asphalt');
    await page.selectOption('[name="stories"]', '2');
    await page.selectOption('[name="approximateAge"]', '10-20');
    await page.click('button:has-text("Continue")');

    // Step 3: Select package
    await page.click('[data-testid="package-better"]');
    await page.click('button:has-text("Continue")');

    // Step 4: Contact information
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="phone"]', '512-555-1234');
    await page.click('button:has-text("Submit")');

    // Verify confirmation
    await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
    await expect(page.locator('text=Thank you')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/quote');

    // Try to continue without filling fields
    await page.click('button:has-text("Continue")');

    // Should show validation errors
    await expect(page.locator('text=Please enter a valid street address')).toBeVisible();
    await expect(page.locator('text=Please enter a city')).toBeVisible();
  });
});
```

---

## Anti-Patterns (Avoid These)

### Do Not: Mix Server and Client Concerns

```typescript
// BAD - fetching in client when data doesn't change
'use client';
import { useEffect, useState } from 'react';

export function PackageList() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetch('/api/packages').then(r => r.json()).then(setPackages);
  }, []);

  return /* ... */;
}

// GOOD - fetch in Server Component
import { getPackages } from '@/lib/db/queries/packages';
import { PackageListClient } from './PackageListClient';

export async function PackageList() {
  const packages = await getPackages();
  return <PackageListClient packages={packages} />;
}
```

### Do Not: Use Inline Styles Instead of Tokens

```typescript
// BAD - hardcoded values
<div style={{ padding: '16px', color: '#333', borderRadius: '8px' }}>

// GOOD - use design tokens via CSS Modules
<div className={styles.card}>

/* In .module.css */
.card {
  padding: var(--rr-space-4);
  color: var(--rr-color-text-primary);
  border-radius: var(--rr-radius-md);
}
```

### Do Not: Skip Error Handling in Actions

```typescript
// BAD - errors crash silently
export async function updateQuote(id: string, data: unknown) {
  const quote = await db.update(quotes).set(data).where(eq(quotes.id, id));
  return quote;
}

// GOOD - proper error handling with typed results
export async function updateQuote(
  id: string,
  data: UpdateQuoteInput
): Promise<ActionResult<Quote>> {
  try {
    const validated = updateQuoteSchema.parse(data);
    const [quote] = await db
      .update(quotes)
      .set(validated)
      .where(eq(quotes.id, id))
      .returning();

    if (!quote) {
      return actionError('NOT_FOUND', 'Quote not found');
    }

    return actionSuccess(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return actionError('VALIDATION_ERROR', 'Invalid data', error.flatten().fieldErrors);
    }
    console.error('Failed to update quote:', error);
    return actionError('INTERNAL_ERROR', 'Failed to update quote');
  }
}
```

### Do Not: Create Uncontrolled Form Inputs

```typescript
// BAD - uncontrolled with DOM queries
function ContactForm() {
  const handleSubmit = () => {
    const email = document.getElementById('email').value;
    // ...
  };
}

// GOOD - controlled with React Hook Form
function ContactForm() {
  const { register, handleSubmit } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    // data is typed and validated
  };
}
```

### Do Not: Hardcode External Service URLs

```typescript
// BAD - hardcoded URLs
const response = await fetch('https://api.roofr.com/v1/measurements');

// GOOD - use adapter pattern with config
const roofr = getAdapter('roofr');
const measurement = await roofr.getMeasurement(requestId);
```

### Do Not: Forget Loading and Error States

```typescript
// BAD - no feedback during loading
function QuoteDisplay({ quoteId }) {
  const { data } = useQuote(quoteId);
  return <div>{data?.total}</div>;
}

// GOOD - handle all states
function QuoteDisplay({ quoteId }) {
  const { data, isLoading, error } = useQuote(quoteId);

  if (isLoading) return <QuoteSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return <EmptyState />;

  return <div>{data.total}</div>;
}
```

---

## Quality Checklist

Before considering this document complete, verify:

- [x] Component patterns cover Server/Client separation
- [x] Ark UI integration pattern documented
- [x] State management patterns for TanStack Query, RHF, Context
- [x] Data fetching covers Server Components, Actions, Route Handlers
- [x] Form patterns include Zod validation and multi-step flows
- [x] Styling patterns use CSS Modules with --rr-* tokens
- [x] Database patterns show Drizzle queries and transactions
- [x] Error handling covers boundaries, actions, and API routes
- [x] Integration patterns use adapter approach
- [x] Testing patterns cover unit, component, hook, action, and E2E
- [x] Anti-patterns section documents what to avoid
- [x] All examples use Results Roofing tech stack (no Vue, no Tailwind, no Zustand)

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [06-component-specs.md](./06-component-specs.md) | Component APIs and specifications |
| [08-data-models.md](./08-data-models.md) | Database schemas for query patterns |
| [09-api-contracts.md](./09-api-contracts.md) | API endpoints and action contracts |
| [15-file-architecture.md](./15-file-architecture.md) | Where patterns live in the codebase |
| [16-design-tokens.md](./16-design-tokens.md) | CSS custom properties used in styling |
