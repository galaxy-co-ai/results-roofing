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
      { name: 'Access handoff (hosting, DNS, APIs)', status: 'todo', priority: 'high', note: 'Awaiting client' },
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
      { name: 'JobNimbus CRM adapter', status: 'backlog', priority: 'high', note: 'Awaiting API credentials' },
      { name: 'Roofr measurement adapter', status: 'backlog', priority: 'high', note: 'Awaiting API credentials' },
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
      { name: 'Financing options UI', status: 'todo', priority: 'high', note: 'Wisetack stub - awaiting partnership' },
      { name: 'Appointment booking UI', status: 'todo', priority: 'high', note: 'Cal.com stub - awaiting account' },
      { name: 'Contract signing UI', status: 'todo', priority: 'high', note: 'Documenso stub - awaiting account' },
      { name: 'Payment (deposit) integration', status: 'done', priority: 'high', note: 'Stripe integration complete' },
      { name: 'Confirmation page', status: 'done', priority: 'medium' },
      { name: 'Customer portal', status: 'in_progress', priority: 'high', note: 'Dashboard done, other views pending' },
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
    ],
  },
  {
    id: '5',
    name: 'Testing & QA',
    deliverables: [
      { name: 'Cross-browser testing', status: 'backlog', priority: 'medium' },
      { name: 'Mobile responsiveness audit', status: 'backlog', priority: 'high' },
      { name: 'Accessibility audit (WCAG)', status: 'backlog', priority: 'high' },
      { name: 'Performance optimization', status: 'backlog', priority: 'medium' },
      { name: 'E2E test suite', status: 'in_progress', priority: 'high' },
    ],
  },
  {
    id: '6',
    name: 'Launch Prep',
    deliverables: [
      { name: 'Staging deployment', status: 'backlog', priority: 'high' },
      { name: 'DNS configuration', status: 'backlog', priority: 'high' },
      { name: 'SSL certificates', status: 'backlog', priority: 'high' },
      { name: 'Production deployment', status: 'backlog', priority: 'urgent' },
      { name: 'Monitoring setup', status: 'backlog', priority: 'medium' },
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
