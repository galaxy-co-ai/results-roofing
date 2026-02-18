'use client';

import { CheckCircle, Calendar, Shield, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import styles from './ReassuranceModal.module.css';

interface ReassuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierDisplayName: string;
  totalPrice: number;
  onContinue: () => void;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReassuranceModal({
  open,
  onOpenChange,
  tierDisplayName,
  totalPrice,
  onContinue,
}: ReassuranceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            <span className={styles.titleIcon}>
              <CheckCircle size={24} aria-hidden="true" />
            </span>
            Great choice!
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          {/* Selected package confirmation */}
          <div className={styles.packageConfirm}>
            <span className={styles.packageLabel}>Selected package</span>
            <div className={styles.packageDetails}>
              <span className={styles.packageName}>{tierDisplayName}</span>
              <span className={styles.packagePrice}>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* What happens next */}
          <div className={styles.nextSteps}>
            <h3 className={styles.nextStepsTitle}>What happens next</h3>
            <ul className={styles.stepsList}>
              <li className={styles.step}>
                <Calendar size={18} className={styles.stepIcon} aria-hidden="true" />
                <span>Pick your preferred installation date</span>
              </li>
              <li className={styles.step}>
                <Shield size={18} className={styles.stepIcon} aria-hidden="true" />
                <span>Your date is held for 48 hours — no payment required now</span>
              </li>
            </ul>
          </div>

          {/* Reassurance note */}
          <p className={styles.reassurance}>
            You&apos;re not committing to anything yet. You can review everything before confirming.
          </p>
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={onContinue}
            className={styles.continueButton}
          >
            Pick My Installation Date
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReassuranceModal;
