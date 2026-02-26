'use client';

import styles from './ProjectTimeline.module.css';

const STAGES = ['Quote', 'Contract', 'Consult', 'Deposit', 'Install', 'Complete'];

interface ProjectTimelineProps {
  currentStage: number; // 1=Quote, 2=Contract, 3=Consultation, 4=Deposit, 5=Install, 6=Complete
}

export function ProjectTimeline({ currentStage }: ProjectTimelineProps) {
  return (
    <div className={styles.timeline}>
      {STAGES.map((stage, index) => {
        const stageNum = index + 1;
        const isCompleted = stageNum < currentStage;
        const isCurrent = stageNum === currentStage;

        return (
          <div key={stage} className={styles.stageGroup}>
            {index > 0 && (
              <div
                className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : isCurrent ? styles.connectorCurrent : ''}`}
              />
            )}
            <div className={styles.stage}>
              <div
                className={`${styles.dot} ${isCompleted ? styles.dotCompleted : isCurrent ? styles.dotCurrent : styles.dotUpcoming}`}
              />
              <span
                className={`${styles.label} ${isCompleted ? styles.labelCompleted : isCurrent ? styles.labelCurrent : styles.labelUpcoming}`}
              >
                {stage}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
