'use client';

import { useUser } from '@clerk/nextjs';
import { PortalHeader } from '@/components/features/portal/PortalHeader/PortalHeader';
import { ProjectTimeline } from '@/components/features/portal/ProjectTimeline/ProjectTimeline';
import { Checklist } from '@/components/features/portal/Checklist/Checklist';
import { QuoteSummaryCard } from '@/components/features/portal/QuoteSummaryCard/QuoteSummaryCard';
import { usePortalPhase } from '@/hooks/usePortalPhase';
import { PortalPhase } from '@/lib/portal/phases';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

function MyProjectSkeleton() {
  return (
    <div className={styles.page}>
      <PortalHeader title="My Project" />
      <div className={styles.skeletonBlock} style={{ height: 48 }} />
      <div className={styles.skeletonBlock} style={{ height: 200 }} />
    </div>
  );
}

function Phase1Content() {
  return (
    <>
      <p className={styles.subtitle}>Complete these steps to get started with your roof replacement</p>
      <ProjectTimeline currentStage={1} />
      <Checklist
        activeStep={1}
        stepCtas={{ 1: { label: 'Start Quote →', href: '/quote/new' } }}
      />
    </>
  );
}

function Phase2Content({ quote, order }: { quote: any; order: any }) {
  const address = order?.propertyAddress || quote?.address || '';
  const city = order?.propertyCity || quote?.city || '';
  const state = order?.propertyState || quote?.state || '';
  const tier = order?.selectedTier || quote?.selectedTier || 'good';
  const total = order?.totalPrice || quote?.totalPrice || 0;
  const installDate = order?.scheduledStartDate || quote?.scheduledDate || null;

  return (
    <>
      <p className={styles.subtitle}>Your quote is ready — review and sign your contract</p>
      <ProjectTimeline currentStage={2} />
      <QuoteSummaryCard
        address={address}
        city={city}
        state={state}
        packageTier={tier}
        totalPrice={total}
        installDate={installDate}
      />
      <Checklist
        activeStep={2}
        stepCtas={{ 2: { label: 'Review Contract →', href: '/portal/documents' } }}
      />
    </>
  );
}

function Phase3Content({ order }: { order: any }) {
  return (
    <>
      <p className={styles.subtitle}>Your project is underway — installation is being scheduled</p>
      <ProjectTimeline currentStage={5} />
      {order && (
        <QuoteSummaryCard
          address={order.propertyAddress}
          city={order.propertyCity}
          state={order.propertyState}
          packageTier={order.selectedTier}
          totalPrice={order.totalPrice}
          installDate={order.scheduledStartDate}
        />
      )}
      <Checklist
        activeStep={5}
        stepCtas={{ 5: { label: 'View Schedule →', href: '/portal/schedule' } }}
      />
    </>
  );
}

function MyProjectContent({ email }: { email: string | null }) {
  const { phase, isLoading, order, quote } = usePortalPhase(email);

  if (isLoading) return <MyProjectSkeleton />;

  return (
    <div className={styles.page}>
      <PortalHeader title="My Project" />
      {phase?.phase === PortalPhase.PRE_QUOTE && <Phase1Content />}
      {phase?.phase === PortalPhase.QUOTED && <Phase2Content quote={quote} order={order} />}
      {phase?.phase === PortalPhase.CONTRACTED && <Phase3Content order={order} />}
      {(phase?.phase === PortalPhase.IN_PROGRESS || phase?.phase === PortalPhase.COMPLETE) && (
        <div className={styles.shellPlaceholder}>
          <p>Phase {phase.phase} content coming soon.</p>
        </div>
      )}
    </div>
  );
}

function ClerkMyProject() {
  const { user } = useUser();
  return <MyProjectContent email={user?.primaryEmailAddress?.emailAddress ?? null} />;
}

function DevMyProject() {
  return <MyProjectContent email={MOCK_USER.primaryEmailAddress.emailAddress} />;
}

export default function MyProjectPage() {
  if (DEV_BYPASS_ENABLED) return <DevMyProject />;
  return <ClerkMyProject />;
}
