'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket,
  Layers,
  Code2,
  BarChart3,
  TestTube2,
  Send,
  HeartHandshake,
  ChevronDown,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react';
import styles from './page.module.css';
import { PhaseTimeline } from '@/components/ui/phase-timeline';
import { Dock, DockIcon } from '@/components/ui/dock';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================
// SOW Data
// ============================================
type Status = 'complete' | 'in_progress' | 'pending' | 'blocked';

interface Deliverable {
  name: string;
  status: Status;
  note?: string;
}

interface Phase {
  id: number;
  name: string;
  status: Status;
  deliverables: Deliverable[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Discovery & Kickoff',
    status: 'complete',
    deliverables: [
      { name: 'Kickoff meeting', status: 'complete' },
      { name: 'Access handoff (hosting, DNS, APIs)', status: 'pending', note: 'Awaiting client' },
      { name: 'Confirm domain & hosting', status: 'pending', note: 'Awaiting client' },
    ],
  },
  {
    id: 2,
    name: 'Foundations',
    status: 'in_progress',
    deliverables: [
      { name: 'Neon PostgreSQL setup', status: 'complete' },
      { name: 'Drizzle ORM migrations', status: 'complete' },
      { name: 'Clerk authentication', status: 'complete' },
      { name: 'JobNimbus CRM adapter', status: 'blocked', note: 'Awaiting API credentials' },
      { name: 'Roofr measurement adapter', status: 'blocked', note: 'Awaiting API credentials' },
      { name: 'Analytics infrastructure', status: 'complete' },
      { name: 'Event taxonomy defined', status: 'complete' },
    ],
  },
  {
    id: 3,
    name: 'Core Build',
    status: 'in_progress',
    deliverables: [
      { name: 'Address entry page', status: 'complete' },
      { name: 'Preliminary estimate', status: 'complete' },
      { name: 'Measuring (satellite)', status: 'complete', note: 'With timeout fallback' },
      { name: 'Package selection', status: 'complete' },
      { name: 'Financing options', status: 'pending', note: 'UI only - Wisetack stub' },
      { name: 'Appointment booking', status: 'pending', note: 'UI only - Cal.com stub' },
      { name: 'Contract signing', status: 'pending', note: 'UI only - Documenso stub' },
      { name: 'Payment (deposit)', status: 'complete', note: 'Stripe integration' },
      { name: 'Confirmation page', status: 'complete' },
      { name: 'Customer portal', status: 'in_progress', note: 'Dashboard done, others pending' },
    ],
  },
  {
    id: 4,
    name: 'Analytics & Tracking',
    status: 'complete',
    deliverables: [
      { name: 'GTM container loader', status: 'complete' },
      { name: 'dataLayer integration', status: 'complete' },
      { name: 'sGTM collection endpoint', status: 'complete' },
      { name: 'Funnel event tracking', status: 'complete' },
      { name: 'Conversion tracking', status: 'complete' },
      { name: 'Consent management', status: 'complete' },
    ],
  },
  {
    id: 5,
    name: 'Testing & QA',
    status: 'pending',
    deliverables: [
      { name: 'Cross-browser testing', status: 'pending' },
      { name: 'Mobile responsiveness', status: 'pending' },
      { name: 'Accessibility audit', status: 'pending' },
      { name: 'Performance optimization', status: 'pending' },
      { name: 'E2E test suite', status: 'in_progress' },
    ],
  },
  {
    id: 6,
    name: 'Launch Prep',
    status: 'pending',
    deliverables: [
      { name: 'Staging deployment', status: 'pending' },
      { name: 'DNS configuration', status: 'pending' },
      { name: 'SSL certificates', status: 'pending' },
      { name: 'Production deployment', status: 'pending' },
      { name: 'Monitoring setup', status: 'pending' },
    ],
  },
  {
    id: 7,
    name: 'Post-Launch',
    status: 'pending',
    deliverables: [
      { name: '30-day support period', status: 'pending' },
      { name: 'Bug fixes', status: 'pending' },
      { name: 'Feature flag system', status: 'pending' },
      { name: 'Documentation handoff', status: 'pending' },
    ],
  },
];

const PHASE_ICONS = [Rocket, Layers, Code2, BarChart3, TestTube2, Send, HeartHandshake];

const STATUS_CONFIG = {
  complete: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Complete' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
  pending: { icon: Circle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' },
  blocked: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Blocked' },
};

export default function AdminDashboard() {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [expandedDeliverable, setExpandedDeliverable] = useState<number | null>(null);

  const selectedPhase = PHASES.find(p => p.id === selectedPhaseId);


  const handlePhaseClick = (phaseId: number) => {
    if (selectedPhaseId === phaseId) {
      setSelectedPhaseId(null);
      setExpandedDeliverable(null);
    } else {
      setSelectedPhaseId(phaseId);
      setExpandedDeliverable(null);
    }
  };

  const toggleDeliverable = (index: number) => {
    setExpandedDeliverable(expandedDeliverable === index ? null : index);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Results Roofing Website Overhaul — MVP B</p>
          </div>
        </div>
      </header>

      {/* Phase Dock */}
      <div className="flex justify-center">
        <TooltipProvider>
          <Dock direction="middle" iconSize={44} iconMagnification={52} iconDistance={100}>
            {PHASES.map((phase) => {
              const Icon = PHASE_ICONS[phase.id - 1];
              const isComplete = phase.status === 'complete';
              const isInProgress = phase.status === 'in_progress';
              const isSelected = selectedPhaseId === phase.id;
              
              return (
                <DockIcon key={phase.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handlePhaseClick(phase.id)}
                        className={`
                          size-full rounded-full flex items-center justify-center transition-all
                          ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''}
                          ${isComplete 
                            ? 'bg-emerald-500 text-white' 
                            : isInProgress 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-muted/80 text-muted-foreground hover:bg-muted'
                          }
                        `}
                      >
                        <Icon className="size-1/2" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      <p className="text-xs font-medium">Phase {phase.id}: {phase.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              );
            })}
          </Dock>
        </TooltipProvider>
      </div>

      {/* Selected Phase Content */}
      <AnimatePresence mode="wait">
        {selectedPhase && (
          <motion.div
            key={selectedPhase.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Phase Timeline */}
            <div className="pt-2">
              <PhaseTimeline
                phaseId={selectedPhase.id}
                phaseName={selectedPhase.name}
                phaseStatus={selectedPhase.status}
                deliverables={selectedPhase.deliverables}
              />
            </div>

            {/* Checkpoint List */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Checkpoints
              </p>
              
              <div className="space-y-1">
                {selectedPhase.deliverables.map((deliverable, index) => {
                  const config = STATUS_CONFIG[deliverable.status];
                  const StatusIcon = config.icon;
                  const isExpanded = expandedDeliverable === index;

                  return (
                    <div key={index} className="rounded-lg border bg-background overflow-hidden">
                      <button
                        onClick={() => toggleDeliverable(index)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <StatusIcon size={16} className={config.color} />
                        <span className="flex-1 text-sm font-medium">{deliverable.name}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <ChevronDown 
                          size={14} 
                          className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 pt-1 border-t bg-muted/30">
                              <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                  <span className="text-muted-foreground/50 mt-1">•</span>
                                  <span><strong>Status:</strong> {config.label}</span>
                                </li>
                                {deliverable.note && (
                                  <li className="flex items-start gap-2">
                                    <span className="text-muted-foreground/50 mt-1">•</span>
                                    <span><strong>Note:</strong> {deliverable.note}</span>
                                  </li>
                                )}
                                <li className="flex items-start gap-2">
                                  <span className="text-muted-foreground/50 mt-1">•</span>
                                  <span><strong>Phase:</strong> {selectedPhase.name}</span>
                                </li>
                                {deliverable.status === 'blocked' && (
                                  <li className="flex items-start gap-2 text-rose-600">
                                    <span className="text-rose-400 mt-1">•</span>
                                    <span><strong>Action Required:</strong> Client input needed to proceed</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State when no phase selected */}
      {!selectedPhase && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Click a phase icon above to view its timeline and checkpoints
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <span className="text-xs text-muted-foreground">Quick links:</span>
        <div className="flex gap-2">
          <Link 
            href="/admin/changelog"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Changelog
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link 
            href="/admin/tasks"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Tasks
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link 
            href="/admin/notes"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Notes
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link 
            href="/admin/database"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Database
          </Link>
        </div>
      </div>
    </div>
  );
}
