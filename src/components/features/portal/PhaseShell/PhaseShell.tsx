import { Hammer, PartyPopper } from 'lucide-react';
import styles from './PhaseShell.module.css';

interface PhaseShellProps {
  phase: 'in-progress' | 'complete';
  page: 'project' | 'payments' | 'documents' | 'schedule';
}

const PHASE_CONFIG = {
  'in-progress': {
    icon: Hammer,
    title: 'Project In Progress',
    description: 'Live updates for your installation will appear here once work begins.',
  },
  complete: {
    icon: PartyPopper,
    title: 'Project Complete',
    description: 'Your completed project summary, warranty details, and referral options will appear here.',
  },
};

export function PhaseShell({ phase, page }: PhaseShellProps) {
  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;

  return (
    <div className={styles.shell}>
      <div className={styles.iconCircle}>
        <Icon size={24} />
      </div>
      <h2 className={styles.title}>{config.title}</h2>
      <p className={styles.description}>{config.description}</p>
      <span className={styles.badge}>Coming Soon</span>
    </div>
  );
}
