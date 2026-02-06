/**
 * Seed script to create tasks from SOW deliverables
 * This creates a task for each deliverable, linking them to phases
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// SOW Data - Same structure as in the SOW page
const PHASES = [
  {
    id: '1',
    name: 'Discovery & Kickoff',
    deliverables: [
      { name: 'Kickoff meeting', status: 'done', priority: 'high' },
      { name: 'Access handoff (hosting, DNS, APIs)', status: 'todo', priority: 'high', note: 'Need: GAF QuickMeasure API credentials + SiteGround DNS access' },
      { name: 'Confirm domain & hosting', status: 'todo', priority: 'medium', note: 'Awaiting client' },
    ],
  },
  {
    id: '2',
    name: 'Foundations',
    deliverables: [
      { name: 'Neon PostgreSQL setup', status: 'done', priority: 'high' },
      { name: 'Drizzle ORM migrations', status: 'done', priority: 'high' },
      { name: 'Clerk authentication', status: 'done', priority: 'high' },
      { name: 'JobNimbus CRM adapter', status: 'done', priority: 'high', note: 'Migrated to GHL' },
      { name: 'GAF QuickMeasure adapter', status: 'backlog', priority: 'high', note: 'Awaiting API credentials' },
      { name: 'Analytics infrastructure', status: 'done', priority: 'medium' },
      { name: 'Event taxonomy defined', status: 'done', priority: 'medium' },
    ],
  },
  {
    id: '3',
    name: 'Core Build',
    deliverables: [
      { name: 'Address entry page', status: 'done', priority: 'high' },
      { name: 'Preliminary estimate', status: 'done', priority: 'high' },
      { name: 'Measuring (satellite)', status: 'done', priority: 'high', note: 'With timeout fallback' },
      { name: 'Package selection', status: 'done', priority: 'high' },
      { name: 'Financing options UI', status: 'backlog', priority: 'high', note: 'Stub only - migrating from Wisetack to Enhancify, awaiting merchant account' },
      { name: 'Appointment booking UI', status: 'done', priority: 'high', note: 'Cal.com adapter complete' },
      { name: 'Contract signing UI', status: 'done', priority: 'high', note: 'DocuSeal adapter complete (migrated from Documenso)' },
      { name: 'Payment (deposit) integration', status: 'done', priority: 'high', note: 'Stripe integration complete' },
      { name: 'Quote confirmation card', status: 'todo', priority: 'high', note: 'Replace deposit step with booking confirmation (no payment at quote time)' },
      { name: 'Portal deposit collection', status: 'todo', priority: 'high', note: 'Move deposit payment to customer portal dashboard' },
      { name: 'Confirmation page', status: 'done', priority: 'medium' },
      { name: 'Customer portal', status: 'done', priority: 'high', note: '5 pages: home, dashboard, documents, payments, schedule' },
    ],
  },
  {
    id: '4',
    name: 'Analytics & Tracking',
    deliverables: [
      { name: 'GTM container loader', status: 'done', priority: 'medium' },
      { name: 'dataLayer integration', status: 'done', priority: 'medium' },
      { name: 'sGTM collection endpoint', status: 'done', priority: 'medium' },
      { name: 'Funnel event tracking', status: 'done', priority: 'high' },
      { name: 'Conversion tracking', status: 'done', priority: 'high' },
      { name: 'Consent management', status: 'done', priority: 'medium' },
      { name: 'Connect Google Analytics (GA4)', status: 'backlog', priority: 'high', note: 'Blocked: awaiting domain/DNS decision from client' },
      { name: 'Connect Google Tag Manager', status: 'backlog', priority: 'high', note: 'Blocked: awaiting domain/DNS decision from client' },
    ],
  },
  {
    id: '5',
    name: 'Testing & QA',
    deliverables: [
      { name: 'E2E test suite', status: 'done', priority: 'high', note: '31 tests passing' },
      { name: 'Performance optimization', status: 'done', priority: 'medium', note: 'LCP 6.7s → 4.5s' },
      { name: 'Accessibility audit (WCAG)', status: 'done', priority: 'high', note: '86% → 92%' },
      { name: 'Mobile responsiveness audit', status: 'todo', priority: 'high' },
      { name: 'Cross-browser testing', status: 'todo', priority: 'medium' },
    ],
  },
  {
    id: '6',
    name: 'Launch Prep',
    deliverables: [
      { name: 'Staging deployment', status: 'done', priority: 'high', note: 'Vercel preview' },
      { name: 'Production deployment', status: 'done', priority: 'urgent', note: 'results-roofing.vercel.app' },
      { name: 'SSL certificates', status: 'done', priority: 'high', note: 'Vercel auto-SSL' },
      { name: 'Monitoring setup', status: 'done', priority: 'medium', note: 'Sentry integrated' },
      { name: 'DNS configuration', status: 'todo', priority: 'high', note: 'Custom domain pending' },
    ],
  },
  {
    id: '7',
    name: 'Post-Launch',
    deliverables: [
      { name: '30-day support period', status: 'backlog', priority: 'medium' },
      { name: 'Bug fixes & patches', status: 'backlog', priority: 'high' },
      { name: 'Feature flag system', status: 'backlog', priority: 'low' },
      { name: 'Documentation handoff', status: 'backlog', priority: 'medium' },
    ],
  },
];

async function seedSOWTasks() {
  console.log('🚀 Seeding SOW tasks...\n');

  // First, clear existing SOW-linked tasks to avoid duplicates
  const existingResult = await sql`
    SELECT COUNT(*) as count FROM dev_tasks WHERE phase_id IS NOT NULL
  `;
  const existingCount = parseInt(existingResult[0].count);
  
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing SOW tasks. Clearing...`);
    await sql`DELETE FROM dev_tasks WHERE phase_id IS NOT NULL`;
    console.log('✓ Cleared existing SOW tasks\n');
  }

  let totalCreated = 0;

  for (const phase of PHASES) {
    console.log(`📋 Phase ${phase.id}: ${phase.name}`);
    
    for (const deliverable of phase.deliverables) {
      await sql`
        INSERT INTO dev_tasks (
          title,
          description,
          status,
          priority,
          category,
          phase_id,
          phase_name,
          sow_deliverable,
          checklist
        ) VALUES (
          ${deliverable.name},
          ${deliverable.note || null},
          ${deliverable.status},
          ${deliverable.priority},
          'feature',
          ${phase.id},
          ${phase.name},
          ${deliverable.name},
          '[]'::jsonb
        )
      `;
      
      const statusIcon = deliverable.status === 'done' ? '✅' : 
                         deliverable.status === 'in_progress' ? '🔄' : 
                         deliverable.status === 'todo' ? '📝' : '⏳';
      console.log(`   ${statusIcon} ${deliverable.name}`);
      totalCreated++;
    }
    console.log('');
  }

  console.log(`\n✅ Created ${totalCreated} SOW tasks across ${PHASES.length} phases`);
}

seedSOWTasks().catch(console.error);
