/**
 * Seed script for dev_tasks table based on SOW progress
 * Run with: node scripts/seed-dev-tasks.mjs
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define enums inline
const taskStatusEnum = pgEnum('task_status', [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
]);

const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

const taskCategoryEnum = pgEnum('task_category', [
  'feature',
  'bug',
  'refactor',
  'design',
  'docs',
  'test',
  'chore',
]);

// Define the schema inline for the seed script
const devTasks = pgTable('dev_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('backlog').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(),
  category: taskCategoryEnum('category').default('feature').notNull(),
  feedbackId: uuid('feedback_id'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Tasks derived from SOW Progress Tracker
const taskData = [
  // ============================================
  // Phase 3: Core Build - UI Stubs
  // ============================================
  {
    title: 'Financing options UI (Wisetack stub)',
    description: 'Build the financing options page with Wisetack integration stub. UI only until client provides Wisetack partnership details.',
    status: 'todo',
    priority: 'high',
    category: 'feature',
  },
  {
    title: 'Appointment booking UI (Cal.com stub)',
    description: 'Build the appointment booking interface with Cal.com integration stub. UI only until client sets up Cal.com account.',
    status: 'todo',
    priority: 'high',
    category: 'feature',
  },
  {
    title: 'Contract signing UI (Documenso stub)',
    description: 'Build the e-signature flow with Documenso integration stub. UI only until client sets up Documenso account.',
    status: 'todo',
    priority: 'high',
    category: 'feature',
  },

  // ============================================
  // Phase 3: Customer Portal Pages
  // ============================================
  {
    title: 'Customer Portal - Documents page',
    description: 'Build the documents section of customer portal to display contracts, warranties, and project documents. Currently showing mock data.',
    status: 'todo',
    priority: 'medium',
    category: 'feature',
  },
  {
    title: 'Customer Portal - Payments page',
    description: 'Build the payments history section of customer portal showing payment schedule and history. Currently showing mock data.',
    status: 'todo',
    priority: 'medium',
    category: 'feature',
  },
  {
    title: 'Customer Portal - Schedule page',
    description: 'Build the schedule/timeline section of customer portal showing project milestones and upcoming appointments. Currently showing mock data.',
    status: 'todo',
    priority: 'medium',
    category: 'feature',
  },

  // ============================================
  // Phase 3: Integration Stubs
  // ============================================
  {
    title: 'Resend email integration stub',
    description: 'Set up Resend email service integration with stub/mock for development. Prepare email templates for order confirmations, reminders, etc.',
    status: 'backlog',
    priority: 'medium',
    category: 'feature',
  },
  {
    title: 'SignalWire SMS integration stub',
    description: 'Set up SignalWire SMS integration with stub/mock for development. Prepare SMS templates for appointment reminders and status updates.',
    status: 'backlog',
    priority: 'low',
    category: 'feature',
  },

  // ============================================
  // Phase 5: Testing & QA
  // ============================================
  {
    title: 'Cross-browser testing',
    description: 'Test application across Chrome, Firefox, Safari, and Edge. Document and fix any browser-specific issues.',
    status: 'backlog',
    priority: 'medium',
    category: 'test',
  },
  {
    title: 'Mobile responsiveness audit',
    description: 'Comprehensive audit of all pages on mobile devices (iOS Safari, Android Chrome). Fix responsive design issues.',
    status: 'backlog',
    priority: 'high',
    category: 'test',
  },
  {
    title: 'Accessibility (WCAG) audit',
    description: 'Run accessibility audit using axe-core and manual testing. Ensure WCAG 2.1 AA compliance. Fix ARIA labels, keyboard navigation, and color contrast issues.',
    status: 'backlog',
    priority: 'high',
    category: 'test',
  },
  {
    title: 'Performance optimization',
    description: 'Analyze and optimize Core Web Vitals (LCP, FID, CLS). Implement image optimization, code splitting, and caching strategies.',
    status: 'backlog',
    priority: 'medium',
    category: 'refactor',
  },
  {
    title: 'E2E test suite completion',
    description: 'Complete Playwright E2E test suite covering quote flow, checkout, portal access. Currently partial coverage.',
    status: 'in_progress',
    priority: 'high',
    category: 'test',
  },

  // ============================================
  // Phase 6: Launch Prep
  // ============================================
  {
    title: 'Staging deployment setup',
    description: 'Set up staging environment on Vercel with preview deployments. Configure staging database and environment variables.',
    status: 'backlog',
    priority: 'medium',
    category: 'chore',
  },
  {
    title: 'Monitoring and error tracking setup',
    description: 'Set up Sentry for error tracking and logging. Configure alerts for critical errors and performance issues.',
    status: 'backlog',
    priority: 'medium',
    category: 'chore',
  },

  // ============================================
  // Phase 7: Documentation
  // ============================================
  {
    title: 'Technical documentation handoff',
    description: 'Prepare technical documentation for client handoff: architecture overview, deployment guide, environment setup, API documentation.',
    status: 'backlog',
    priority: 'low',
    category: 'docs',
  },
  {
    title: 'Feature flag system implementation',
    description: 'Implement feature flag system for gradual rollouts and A/B testing. Consider using Vercel Edge Config or similar.',
    status: 'backlog',
    priority: 'low',
    category: 'feature',
  },

  // ============================================
  // Bug Fixes / Improvements
  // ============================================
  {
    title: 'Fix PostCSS/Tailwind v4 configuration',
    description: 'Resolve PostCSS plugin error: "tailwindcss directly as a PostCSS plugin" - need to install @tailwindcss/postcss and update config.',
    status: 'todo',
    priority: 'urgent',
    category: 'bug',
  },
];

async function seed() {
  console.log('Seeding dev tasks based on SOW...\n');

  try {
    // Insert new data (don't clear existing - append only)
    const result = await db.insert(devTasks).values(taskData).returning();
    
    console.log(`✅ Created ${result.length} tasks:\n`);
    
    // Group by status for display
    const byStatus = result.reduce((acc, task) => {
      acc[task.status] = acc[task.status] || [];
      acc[task.status].push(task);
      return acc;
    }, {});

    for (const [status, tasks] of Object.entries(byStatus)) {
      console.log(`📋 ${status.toUpperCase()} (${tasks.length}):`);
      tasks.forEach((task) => {
        const priorityEmoji = {
          urgent: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
        }[task.priority];
        console.log(`   ${priorityEmoji} [${task.category}] ${task.title}`);
      });
      console.log('');
    }

    console.log('Seeding complete! Refresh the Tasks page to see the new items.');
  } catch (error) {
    console.error('Error seeding dev tasks:', error);
    process.exit(1);
  }
}

seed();
