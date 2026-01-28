'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';

type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
type SOWStatus = 'complete' | 'in_progress' | 'pending' | 'blocked';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  phaseId: string | null;
  phaseName: string | null;
}

interface Phase {
  id: string;
  name: string;
  tasks: Task[];
}

interface Stats {
  total: number;
  complete: number;
  inProgress: number;
  blocked: number;
  pending: number;
  progress: number;
}

function taskStatusToSOWStatus(status: TaskStatus): SOWStatus {
  switch (status) {
    case 'done':
    case 'review':
      return 'complete';
    case 'in_progress':
      return 'in_progress';
    case 'backlog':
      return 'blocked';
    default:
      return 'pending';
  }
}

function getPhaseStatus(tasks: Task[]): SOWStatus {
  if (tasks.length === 0) return 'pending';
  
  const allComplete = tasks.every(t => t.status === 'done' || t.status === 'review');
  if (allComplete) return 'complete';
  
  const anyInProgress = tasks.some(t => t.status === 'in_progress');
  if (anyInProgress) return 'in_progress';
  
  const anyBlocked = tasks.some(t => t.status === 'backlog' && t.priority === 'high');
  if (anyBlocked) return 'blocked';
  
  return 'pending';
}

function getStatusIcon(status: SOWStatus) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 size={14} />;
    case 'in_progress':
      return <Clock size={14} />;
    case 'blocked':
      return <AlertTriangle size={14} />;
    default:
      return <Circle size={14} />;
  }
}

function getStatusLabel(status: SOWStatus) {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'in_progress':
      return 'In Progress';
    case 'blocked':
      return 'Blocked';
    default:
      return 'Pending';
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function SOWProgressPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/sow/progress');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPhases(data.phases || []);
      setStats(data.stats || null);
      setUpdatedAt(data.updatedAt || null);
      setError(null);
    } catch {
      setError('Unable to load progress data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchProgress, 60000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Loading project progress...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertTriangle size={24} />
          <span>{error}</span>
          <button onClick={fetchProgress} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Image
              src="/brand/logo/icon-dark.svg"
              alt="Results Roofing"
              width={32}
              height={32}
              className={styles.logo}
            />
            <div>
              <h1 className={styles.title}>Results Roofing Website</h1>
              <p className={styles.subtitle}>Scope of Work Progress - MVP B</p>
            </div>
          </div>
          <button 
            onClick={fetchProgress}
            className={styles.refreshBtn}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </header>

        {/* Overall Progress */}
        {stats && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Overall Progress</span>
              <span className={styles.progressValue}>{stats.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <motion.div 
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <CheckCircle2 size={14} className={styles.statIconComplete} />
                <span>{stats.complete} Complete</span>
              </div>
              <div className={styles.statItem}>
                <Clock size={14} className={styles.statIconProgress} />
                <span>{stats.inProgress} In Progress</span>
              </div>
              <div className={styles.statItem}>
                <Circle size={14} className={styles.statIconPending} />
                <span>{stats.pending} Pending</span>
              </div>
              <div className={styles.statItem}>
                <AlertTriangle size={14} className={styles.statIconBlocked} />
                <span>{stats.blocked} Blocked</span>
              </div>
            </div>
          </div>
        )}

        {/* Phases */}
        <div className={styles.phasesSection}>
          {phases.map((phase, index) => {
            const phaseComplete = phase.tasks.filter(t => t.status === 'done' || t.status === 'review').length;
            const phaseTotal = phase.tasks.length;
            const phaseProgress = phaseTotal > 0 ? Math.round((phaseComplete / phaseTotal) * 100) : 0;
            const phaseStatus = getPhaseStatus(phase.tasks);

            return (
              <motion.div 
                key={phase.id}
                className={styles.phaseCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.phaseHeader}>
                  <div className={styles.phaseInfo}>
                    <span className={styles.phaseNumber}>Phase {phase.id}</span>
                    <span className={styles.phaseName}>{phase.name}</span>
                  </div>
                  <div className={styles.phaseStats}>
                    <div className={styles.phaseProgressBar}>
                      <div 
                        className={styles.phaseProgressFill}
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                    <span className={styles.phaseCount}>{phaseComplete}/{phaseTotal}</span>
                    <span className={`${styles.phaseBadge} ${styles[`badge_${phaseStatus}`]}`}>
                      {getStatusIcon(phaseStatus)}
                      {getStatusLabel(phaseStatus)}
                    </span>
                  </div>
                </div>

                <div className={styles.tasksList}>
                  {phase.tasks.map((task) => {
                    const sowStatus = taskStatusToSOWStatus(task.status);
                    return (
                      <div 
                        key={task.id}
                        className={`${styles.taskItem} ${styles[`task_${sowStatus}`]}`}
                      >
                        <span className={styles.taskIcon}>
                          {getStatusIcon(sowStatus)}
                        </span>
                        <span className={styles.taskTitle}>{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            {updatedAt && (
              <span className={styles.updatedAt}>
                Last updated: {formatDate(updatedAt)}
              </span>
            )}
          </div>
          <a 
            href="https://resultsroofing.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.brandLink}
          >
            Results Roofing
            <ExternalLink size={12} />
          </a>
        </footer>
      </motion.div>
    </div>
  );
}
