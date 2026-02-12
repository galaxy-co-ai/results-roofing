'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { PaymentForm } from './PaymentForm';

export type PaymentType = 'deposit' | 'balance';

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  paymentType: PaymentType;
  amount: number;
  onPaymentSuccess: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentDrawer({
  open,
  onOpenChange,
  quoteId,
  paymentType,
  amount,
  onPaymentSuccess,
}: PaymentDrawerProps) {
  const title = paymentType === 'deposit' ? 'Pay Deposit' : 'Pay Remaining Balance';
  const description = paymentType === 'deposit'
    ? 'Secure your installation date with a deposit payment.'
    : 'Pay your remaining project balance in full.';

  function handleSuccess() {
    onOpenChange(false);
    onPaymentSuccess();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 mb-2 rounded-lg bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount Due</span>
            <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
          </div>
        </div>
        <PaymentForm
          quoteId={quoteId}
          depositAmount={amount}
          redirectOnSuccess={false}
          useFixedAmount={true}
          onSuccess={handleSuccess}
        />
      </SheetContent>
    </Sheet>
  );
}
