import { Check } from 'lucide-react';
import styles from './DepositIncludes.module.css';

interface DepositIncludesProps {
  installDate: string;
  totalPrice: number;
  depositAmount: number;
}

/**
 * DepositIncludes - Shows what's included with the deposit
 * Reduces anxiety by highlighting the benefits
 */
export function DepositIncludes({ installDate, totalPrice, depositAmount }: DepositIncludesProps) {
  const formattedDate = new Date(installDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const benefits = [
    `Secures your ${formattedDate} installation date`,
    'Fully refundable if you cancel within 3 business days',
    `Applied toward your $${totalPrice.toLocaleString()} total project cost`,
    'Protects you from price increases',
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        Your ${depositAmount} Deposit Includes:
      </h3>
      <ul className={styles.list}>
        {benefits.map((text, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.iconWrapper}>
              <Check size={14} className={styles.checkIcon} aria-hidden="true" />
            </div>
            <span className={styles.text}>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DepositIncludes;
