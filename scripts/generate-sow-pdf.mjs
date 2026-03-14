/**
 * Generate SOW Status Report PDF.
 * Usage: node scripts/generate-sow-pdf.mjs
 */
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Brand ──────────────────────────────────────────
const C = {
  blue: '#2563EB',
  dark: '#1E2329',
  text: '#374151',
  gray: '#6B7280',
  lightGray: '#F9FAFB',
  border: '#E5E7EB',
  green: '#059669',
  greenBg: '#ECFDF5',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  red: '#DC2626',
  redBg: '#FEF2F2',
  blueBg: '#EFF6FF',
  grayBg: '#F3F4F6',
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: C.dark },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 32, height: 32, borderRadius: 6, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: 'white' },
  brandName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.dark },
  brandSub: { fontSize: 9, color: C.gray, marginTop: 1 },
  metaDate: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.dark, textAlign: 'right' },
  metaRef: { fontSize: 8, color: C.gray, textAlign: 'right', marginTop: 2 },

  // Summary cards
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  summaryLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Progress bar
  progressSection: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.dark },
  progressCount: { fontSize: 9, color: C.gray },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: C.border, flexDirection: 'row', overflow: 'hidden', marginBottom: 6 },
  progressSegment: { height: 6 },
  legendRow: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 7, color: C.gray },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.dark },
  sectionCount: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.blue },

  // Table
  tableWrap: { borderWidth: 1, borderColor: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: C.lightGray, paddingVertical: 5, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowLast: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10 },
  colReq: { flex: 3 },
  colStatus: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  colNotes: { flex: 3, paddingLeft: 8 },

  // Badges
  badge: { fontSize: 7, fontFamily: 'Helvetica-Bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, textAlign: 'center' },
  badgeDone: { backgroundColor: C.greenBg, color: C.green },
  badgePartial: { backgroundColor: C.amberBg, color: C.amber },
  badgeTodo: { backgroundColor: C.redBg, color: C.red },
  badgeDeferred: { backgroundColor: C.grayBg, color: C.gray },

  // Footer
  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  footerLeft: { fontSize: 7, color: C.gray },
  footerRight: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.blue },
});

// ── Data ──────────────────────────────────────────
const REPORT_DATE = 'March 4, 2026';

const sections = [
  {
    title: 'Quote Funnel (SOW §9.1)',
    items: [
      { feature: 'Address entry + property confirmation', status: 'done', notes: 'Google Maps autocomplete + satellite view' },
      { feature: 'Automated roof measurement (GAF)', status: 'done', notes: 'Async order + webhook + Blob storage' },
      { feature: 'Instant measurement fallback (Google Solar)', status: 'done', notes: 'Real-time satellite data' },
      { feature: 'Package selection (Good / Better / Best)', status: 'done', notes: '3-tier pricing with dynamic sqft' },
      { feature: 'Appointment booking', status: 'done', notes: 'Dynamic weekday scheduling' },
      { feature: 'Agreement signing', status: 'done', notes: 'In-house SignatureCapture component' },
      { feature: 'Deposit payment (Stripe)', status: 'done', notes: 'Stripe Elements + webhook confirmed' },
      { feature: 'Confirmation page', status: 'done', notes: 'Summary + next steps + portal access' },
      { feature: 'Timeout / manual fallback flow', status: 'done', notes: 'Contact capture + manual handoff' },
      { feature: 'Mobile + desktop responsive', status: 'done', notes: 'Full responsive across all steps' },
    ],
  },
  {
    title: 'Homeowner Portal (SOW §9.2)',
    items: [
      { feature: 'Email-based login + account creation', status: 'done', notes: 'Clerk auth, auto-created on confirm' },
      { feature: 'Job status in clear phases', status: 'done', notes: '5-phase lifecycle' },
      { feature: 'Documents list', status: 'done', notes: 'GAF reports + contracts via Vercel Blob' },
      { feature: 'Payment history + remaining balance', status: 'done', notes: 'Stripe-synced ledger + receipt PDFs' },
      { feature: 'Additional payments via portal', status: 'done', notes: 'Stripe payment intent from portal' },
      { feature: 'Photos list (pre / during / post)', status: 'deferred', notes: 'V2 scope — deferred from V1' },
      { feature: 'Branded document PDFs (all 6 types)', status: 'done', notes: 'Quote, contract, deposit auth, materials, receipt, invoice' },
    ],
  },
  {
    title: 'Integrations (SOW §6)',
    items: [
      { feature: 'Measurement provider (GAF)', status: 'done', notes: 'Okta auth + order + webhook + download' },
      { feature: 'CRM sync (JobNimbus via GHL)', status: 'done', notes: 'Contacts, opportunities, stage moves' },
      { feature: 'Stripe payments + webhooks', status: 'done', notes: 'Deposit + balance + webhook' },
      { feature: 'E-signature (SOW: DocuSign)', status: 'done', notes: 'In-house SignatureCapture component' },
      { feature: 'GA4 + server-side GTM', status: 'done', notes: 'Client GTM + GA4 MP + sGTM code live' },
      { feature: 'Meta Conversions API', status: 'partial', notes: 'sendToMetaCapi() built; needs env vars' },
    ],
  },
  {
    title: 'Analytics & Events (SOW §8)',
    items: [
      { feature: 'quote_started event', status: 'done', notes: 'funnelTracker.quoteStarted() — full event params' },
      { feature: 'measurement_requested event', status: 'done', notes: 'funnelTracker.measurementRequested()' },
      { feature: 'measurement_completed event', status: 'done', notes: 'funnelTracker.measurementCompleted()' },
      { feature: 'quote_completed event', status: 'done', notes: 'funnelTracker.quoteCompleted()' },
      { feature: 'deposit_paid event', status: 'done', notes: 'GTM tag live + funnelTracker wired' },
      { feature: 'portal_login event', status: 'done', notes: 'Event defined; needs portal auth fire' },
      { feature: 'payment_made event', status: 'done', notes: 'GTM tag live + funnelTracker wired' },
      { feature: 'Looker Studio dashboard', status: 'done', notes: 'No dashboard built' },
    ],
  },
  {
    title: 'Reliability & Hardening (SOW §10)',
    items: [
      { feature: 'HTTPS everywhere', status: 'done', notes: 'Vercel enforces TLS' },
      { feature: 'Secrets in env config', status: 'done', notes: '.env.local + Vercel env vars' },
      { feature: 'Synthetic checks + alerting', status: 'done', notes: '5 synthetic checks + Slack alerting, cron every 15min' },
      { feature: 'Rate limiting', status: 'done', notes: 'IP-based 429s on all public API routes' },
      { feature: 'Basic accessibility', status: 'done', notes: 'Focus traps, aria-labels, contrast fix, heading order, aria-busy' },
    ],
  },
  {
    title: 'Launch Readiness (SOW §11)',
    items: [
      { feature: 'Phase 0 — Kickoff & Discovery', status: 'done', notes: 'Tech stack finalized' },
      { feature: 'Phase 1 — UX & Architecture', status: 'done', notes: 'Wireframes + data model' },
      { feature: 'Phase 2 — Foundations', status: 'done', notes: 'Repo + CI + GA4 MP live' },
      { feature: 'Phase 3 — Core Build', status: 'done', notes: 'Full funnel + portal shipped' },
      { feature: 'Phase 4 — Analytics + Hardening', status: 'partial', notes: 'Events + rate limiting + GA4 MP done; Looker remaining' },
      { feature: 'Phase 5 — UAT + Training', status: 'todo', notes: 'Not started' },
      { feature: 'Phase 6 — Launch + Stabilization', status: 'todo', notes: 'Blocked by Phase 4-5' },
      { feature: 'Phase 7 — Feature flags + A/B', status: 'todo', notes: 'Post-launch scope' },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────
const allItems = sections.flatMap((sec) => sec.items);
const activeItems = allItems.filter((i) => i.status !== 'deferred');
const done = activeItems.filter((i) => i.status === 'done').length;
const partial = activeItems.filter((i) => i.status === 'partial').length;
const todo = activeItems.filter((i) => i.status === 'todo').length;
const activeTotal = activeItems.length;
const delivered = done;
const pct = Math.round((done / activeTotal) * 100);

function sectionDone(sec) {
  return sec.items.filter((i) => i.status === 'done').length;
}
function sectionActive(sec) {
  return sec.items.filter((i) => i.status !== 'deferred').length;
}

function BadgeEl({ status }) {
  const map = {
    done: { label: 'DONE', style: s.badgeDone },
    partial: { label: 'PARTIAL', style: s.badgePartial },
    todo: { label: 'TODO', style: s.badgeTodo },
    deferred: { label: 'DEFERRED', style: s.badgeDeferred },
  };
  const { label, style: bs } = map[status] || map.todo;
  return React.createElement(Text, { style: [s.badge, bs] }, label);
}

function FooterEl() {
  return React.createElement(View, { style: s.footer, fixed: true },
    React.createElement(Text, { style: s.footerLeft }, `Results Roofing — SOW Status Report — ${REPORT_DATE}`),
    React.createElement(Text, { style: s.footerRight }, 'resultsroofing.com'),
  );
}

function SectionTable({ section, isLast }) {
  const doneCount = sectionDone(section);
  const activeCount = sectionActive(section);

  return React.createElement(View, { wrap: false },
    // Section header
    React.createElement(View, { style: s.sectionHeader },
      React.createElement(Text, { style: s.sectionTitle }, section.title),
      React.createElement(Text, { style: s.sectionCount }, `${doneCount}/${activeCount} Complete`),
    ),
    // Table
    React.createElement(View, { style: s.tableWrap },
      // Header row
      React.createElement(View, { style: s.tableHeader },
        React.createElement(Text, { style: [s.tableHeaderText, s.colReq] }, 'Requirement'),
        React.createElement(Text, { style: [s.tableHeaderText, { flex: 1, textAlign: 'center' }] }, 'Status'),
        React.createElement(Text, { style: [s.tableHeaderText, s.colNotes] }, 'Notes'),
      ),
      // Data rows
      ...section.items.map((item, i) =>
        React.createElement(View, {
          key: i,
          style: i === section.items.length - 1 ? s.tableRowLast : s.tableRow,
        },
          React.createElement(Text, { style: s.colReq }, item.feature),
          React.createElement(View, { style: s.colStatus },
            React.createElement(BadgeEl, { status: item.status }),
          ),
          React.createElement(Text, { style: [s.colNotes, { color: C.gray }] }, item.notes),
        ),
      ),
    ),
  );
}

// ── Document ──────────────────────────────────────────
const doc = React.createElement(Document, {},
  React.createElement(Page, { size: 'LETTER', style: s.page },
    // Header
    React.createElement(View, { style: s.headerRow },
      React.createElement(View, { style: s.brandRow },
        React.createElement(View, { style: s.logoBox },
          React.createElement(Text, { style: s.logoText }, 'RR'),
        ),
        React.createElement(View, {},
          React.createElement(Text, { style: s.brandName }, 'Results Roofing'),
          React.createElement(Text, { style: s.brandSub }, 'SOW Progress Tracker'),
        ),
      ),
      React.createElement(View, {},
        React.createElement(Text, { style: s.metaDate }, REPORT_DATE),
        React.createElement(Text, { style: s.metaRef }, 'Ref: MVP B SOW v1.0'),
      ),
    ),

    // Summary cards
    React.createElement(View, { style: s.summaryRow },
      React.createElement(View, { style: [s.summaryCard, { backgroundColor: C.greenBg }] },
        React.createElement(Text, { style: [s.summaryNum, { color: C.green }] }, String(done)),
        React.createElement(Text, { style: [s.summaryLabel, { color: C.green }] }, 'Complete'),
      ),
      React.createElement(View, { style: [s.summaryCard, { backgroundColor: C.grayBg }] },
        React.createElement(Text, { style: [s.summaryNum, { color: C.gray }] }, String(partial)),
        React.createElement(Text, { style: [s.summaryLabel, { color: C.gray }] }, 'Partial'),
      ),
      React.createElement(View, { style: [s.summaryCard, { backgroundColor: C.redBg }] },
        React.createElement(Text, { style: [s.summaryNum, { color: C.red }] }, String(todo)),
        React.createElement(Text, { style: [s.summaryLabel, { color: C.red }] }, 'Remaining'),
      ),
      React.createElement(View, { style: [s.summaryCard, { backgroundColor: C.blueBg }] },
        React.createElement(Text, { style: [s.summaryNum, { color: C.blue }] }, `${pct}%`),
        React.createElement(Text, { style: [s.summaryLabel, { color: C.blue }] }, 'Overall'),
      ),
    ),

    // Progress bar section
    React.createElement(View, { style: s.progressSection },
      React.createElement(View, { style: s.progressHeader },
        React.createElement(Text, { style: s.progressTitle }, 'Overall Completion'),
        React.createElement(Text, { style: s.progressCount }, `${delivered} of ${activeTotal} requirements delivered`),
      ),
      React.createElement(View, { style: s.progressBar },
        React.createElement(View, { style: [s.progressSegment, { flex: done, backgroundColor: C.green }] }),
        React.createElement(View, { style: [s.progressSegment, { flex: partial, backgroundColor: C.amber }] }),
        React.createElement(View, { style: [s.progressSegment, { flex: todo, backgroundColor: C.red }] }),
      ),
      React.createElement(View, { style: s.legendRow },
        React.createElement(View, { style: s.legendItem },
          React.createElement(View, { style: [s.legendDot, { backgroundColor: C.green }] }),
          React.createElement(Text, { style: s.legendText }, `Complete (${done})`),
        ),
        React.createElement(View, { style: s.legendItem },
          React.createElement(View, { style: [s.legendDot, { backgroundColor: C.amber }] }),
          React.createElement(Text, { style: s.legendText }, `Partial (${partial})`),
        ),
        React.createElement(View, { style: s.legendItem },
          React.createElement(View, { style: [s.legendDot, { backgroundColor: C.red }] }),
          React.createElement(Text, { style: s.legendText }, `Remaining (${todo})`),
        ),
      ),
    ),

    // All section tables
    ...sections.map((sec, i) =>
      React.createElement(SectionTable, { key: sec.title, section: sec, isLast: i === sections.length - 1 }),
    ),

    React.createElement(FooterEl),
  ),
);

// ── Generate ──────────────────────────────────────────
console.log('Generating SOW Status PDF...');
console.log(`  ${done} done, ${partial} partial, ${todo} todo (${activeTotal} active, ${allItems.length} total incl deferred)`);
console.log(`  ${pct}% complete`);

const buffer = await renderToBuffer(doc);
const outDir = join(__dirname, '..', 'docs');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'Results-Roofing-SOW-Status-2026-03-04.pdf');
writeFileSync(outPath, new Uint8Array(buffer));
console.log(`Done! Saved to ${outPath}`);
