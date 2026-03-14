import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ── Brand tokens ──────────────────────────────────────────
const BRAND = {
  blue: '#2563EB',
  dark: '#1E2329',
  gray: '#6B7280',
  lightGray: '#F7F9FC',
  border: '#E8EDF5',
  green: '#059669',
  amber: '#D97706',
  red: '#DC2626',
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: BRAND.dark,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.blue,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 8,
    color: BRAND.gray,
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 8,
    color: BRAND.gray,
    textAlign: 'right',
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    marginVertical: 12,
  },
  dividerBold: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND.dark,
    marginVertical: 12,
  },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.dark,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.gray,
    marginBottom: 6,
    marginTop: 10,
  },
  // Summary boxes
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 8,
    color: BRAND.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BRAND.dark,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  colFeature: { flex: 3 },
  colStatus: { flex: 1, textAlign: 'center' },
  colNotes: { flex: 2 },
  // Status badges
  badge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },
  badgeDone: {
    backgroundColor: '#ECFDF5',
    color: BRAND.green,
  },
  badgePartial: {
    backgroundColor: '#FFFBEB',
    color: BRAND.amber,
  },
  badgeMissing: {
    backgroundColor: '#FEF2F2',
    color: BRAND.red,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: BRAND.gray,
  },
  footerBrand: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.blue,
  },
  // Body text
  bodyText: {
    fontSize: 9,
    color: BRAND.dark,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 9,
    color: BRAND.dark,
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 12,
  },
});

// ── Data types ──────────────────────────────────────────
type Status = 'done' | 'partial' | 'missing';

interface LineItem {
  feature: string;
  status: Status;
  notes: string;
}

interface Section {
  title: string;
  items: LineItem[];
}

// ── Report data ──────────────────────────────────────────
const REPORT_DATE = 'March 3, 2026';
const PROJECT = 'Results Roofing Online Quote & Homeowner Portal';
const SOW_REF = 'MVP B SOW v1.0';

const sections: Section[] = [
  {
    title: 'Quote Funnel (SOW §9.1)',
    items: [
      { feature: 'Address entry + property confirmation', status: 'done', notes: 'Google Maps autocomplete + satellite view' },
      { feature: 'Automated roof measurement (GAF)', status: 'done', notes: 'Async order + webhook + Blob storage' },
      { feature: 'Instant measurement fallback (Google Solar)', status: 'done', notes: 'Real-time satellite data, ~$0.075/req' },
      { feature: 'Package selection (Good / Better / Best)', status: 'done', notes: '3-tier pricing with dynamic sqft calculation' },
      { feature: 'Appointment booking', status: 'done', notes: 'Dynamic weekday scheduling from tomorrow' },
      { feature: 'Agreement signing', status: 'done', notes: 'In-house SignatureCapture (not DocuSign)' },
      { feature: 'Deposit payment (Stripe)', status: 'done', notes: 'Stripe Elements, custom UI, webhook confirmed' },
      { feature: 'Confirmation page', status: 'done', notes: 'Summary + next steps + portal access' },
      { feature: 'Timeout / manual fallback flow', status: 'done', notes: 'Contact capture + manual estimate handoff' },
      { feature: 'Mobile + desktop responsive', status: 'done', notes: 'Full responsive across all steps' },
    ],
  },
  {
    title: 'Homeowner Portal (SOW §9.2)',
    items: [
      { feature: 'Email-based login + account creation', status: 'done', notes: 'Clerk auth, auto-created on quote confirmation' },
      { feature: 'Job status in clear phases', status: 'done', notes: '5-phase lifecycle: Pre-Quote → Complete' },
      { feature: 'Documents list', status: 'done', notes: 'GAF reports + contracts via Vercel Blob' },
      { feature: 'Payment history + remaining balance', status: 'done', notes: 'Stripe-synced ledger with receipt PDFs' },
      { feature: 'Additional payments via portal', status: 'done', notes: 'Stripe payment intent from portal' },
      { feature: 'Photos list (pre / during / post job)', status: 'missing', notes: 'No photo upload or gallery built yet' },
      { feature: 'Branded measurement reports', status: 'missing', notes: 'Raw GAF PDFs stored; RR-branded version needed' },
    ],
  },
  {
    title: 'Integrations (SOW §6)',
    items: [
      { feature: 'Measurement provider (GAF QuickMeasure)', status: 'done', notes: 'Okta auth + order + webhook + asset download' },
      { feature: 'CRM sync (JobNimbus via GHL)', status: 'done', notes: 'Contact creation, opportunity pipeline, stage moves' },
      { feature: 'Stripe payments + webhooks', status: 'done', notes: 'Deposit + balance payments, webhook confirmation' },
      { feature: 'E-signature (SOW says DocuSign)', status: 'partial', notes: 'Using Documenso — functionally equivalent, not DocuSign' },
      { feature: 'GA4 + server-side GTM', status: 'missing', notes: 'No sGTM endpoint or event pipeline built' },
      { feature: 'Meta Conversions API (CAPI)', status: 'missing', notes: 'Requires sGTM — blocked by analytics gap' },
    ],
  },
  {
    title: 'Analytics & Event Taxonomy (SOW §8)',
    items: [
      { feature: 'quote_started event', status: 'missing', notes: 'Event taxonomy not implemented' },
      { feature: 'measurement_requested event', status: 'missing', notes: '' },
      { feature: 'measurement_completed event', status: 'missing', notes: '' },
      { feature: 'quote_completed event', status: 'missing', notes: '' },
      { feature: 'deposit_paid event', status: 'missing', notes: '' },
      { feature: 'portal_login event', status: 'missing', notes: '' },
      { feature: 'payment_made event', status: 'missing', notes: '' },
      { feature: 'Looker Studio dashboard (funnel + revenue)', status: 'missing', notes: 'No dashboard built' },
    ],
  },
  {
    title: 'Reliability & Hardening (SOW §10)',
    items: [
      { feature: 'HTTPS everywhere', status: 'done', notes: 'Vercel enforces TLS' },
      { feature: 'Secrets in env config (not source)', status: 'done', notes: '.env.local + Vercel env vars' },
      { feature: 'Synthetic checks (5-15 min intervals)', status: 'missing', notes: 'No health check runner or alerting' },
      { feature: 'Rate limiting on sensitive endpoints', status: 'missing', notes: 'Login + quote creation unprotected' },
      { feature: 'Basic accessibility (keyboard nav)', status: 'partial', notes: 'Works but no formal audit done' },
    ],
  },
  {
    title: 'Launch Readiness (SOW §11)',
    items: [
      { feature: 'Phase 0 — Kickoff & Discovery', status: 'done', notes: 'Tech stack finalized, integrations locked' },
      { feature: 'Phase 1 — UX & Architecture', status: 'done', notes: 'Wireframes, data model, integration patterns' },
      { feature: 'Phase 2 — Foundations & Enablers', status: 'partial', notes: 'Repo + CI/CD done; sGTM not set up' },
      { feature: 'Phase 3 — Core Funnel & Portal Build', status: 'done', notes: 'Full funnel + portal shipped' },
      { feature: 'Phase 4 — Analytics, Reliability, Hardening', status: 'missing', notes: 'Primary remaining gap' },
      { feature: 'Phase 5 — UAT, Training, Content', status: 'missing', notes: 'Not started' },
      { feature: 'Phase 6 — Launch & Stabilization', status: 'missing', notes: 'Blocked by Phase 4-5' },
      { feature: 'Phase 7 — Feature flags & A/B tests', status: 'missing', notes: 'Post-launch scope' },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────
function countByStatus(status: Status): number {
  return sections.reduce((sum, s) => sum + s.items.filter((i) => i.status === status).length, 0);
}

function StatusBadge({ status }: { status: Status }) {
  const label = status === 'done' ? 'DONE' : status === 'partial' ? 'PARTIAL' : 'REMAINING';
  const badgeStyle =
    status === 'done' ? styles.badgeDone : status === 'partial' ? styles.badgePartial : styles.badgeMissing;

  return <Text style={[styles.badge, badgeStyle]}>{label}</Text>;
}

function PageFooter({ pageNum, totalPages }: { pageNum: number; totalPages: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {PROJECT} — SOW Status Report — {REPORT_DATE}
      </Text>
      <Text style={styles.footerText}>
        Page {pageNum} of {totalPages}
      </Text>
      <Text style={styles.footerBrand}>Results Roofing</Text>
    </View>
  );
}

// ── Document ──────────────────────────────────────────
export function SOWStatusDocument() {
  const done = countByStatus('done');
  const partial = countByStatus('partial');
  const missing = countByStatus('missing');
  const total = done + partial + missing;
  const pct = Math.round((done / total) * 100);

  return (
    <Document>
      {/* PAGE 1: Cover + Summary */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Results Roofing</Text>
            <Text style={styles.companyDetail}>(214) 272-2424</Text>
            <Text style={styles.companyDetail}>claims@results-roofing.com</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>SOW Status Report</Text>
            <Text style={styles.docMeta}>{REPORT_DATE}</Text>
            <Text style={styles.docMeta}>Ref: {SOW_REF}</Text>
          </View>
        </View>

        <View style={styles.dividerBold} />

        <Text style={styles.bodyText}>
          This report maps every requirement in the {SOW_REF} against the current state of the
          Results Roofing web application as of {REPORT_DATE}.
        </Text>

        {/* Summary boxes */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.summaryNumber, { color: BRAND.green }]}>{done}</Text>
            <Text style={styles.summaryLabel}>Complete</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#FFFBEB' }]}>
            <Text style={[styles.summaryNumber, { color: BRAND.amber }]}>{partial}</Text>
            <Text style={styles.summaryLabel}>Partial</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.summaryNumber, { color: BRAND.red }]}>{missing}</Text>
            <Text style={styles.summaryLabel}>Remaining</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: BRAND.lightGray }]}>
            <Text style={[styles.summaryNumber, { color: BRAND.blue }]}>{pct}%</Text>
            <Text style={styles.summaryLabel}>Overall</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Key Takeaways</Text>
        <Text style={styles.bulletText}>
          {'\u2022'} Core funnel (address → quote → package → sign → deposit) is fully operational on mobile and desktop.
        </Text>
        <Text style={styles.bulletText}>
          {'\u2022'} Homeowner portal delivers job status, documents, payment history, and additional payments.
        </Text>
        <Text style={styles.bulletText}>
          {'\u2022'} GAF QuickMeasure integration is live with async webhook + Vercel Blob storage for reports.
        </Text>
        <Text style={styles.bulletText}>
          {'\u2022'} CRM sync (via GHL) handles contact creation, opportunity pipeline, and stage progression.
        </Text>
        <Text style={styles.bulletText}>
          {'\u2022'} Primary gap: Phase 4 (Analytics, Reliability, Hardening) — no sGTM, no event taxonomy, no synthetic checks.
        </Text>
        <Text style={styles.bulletText}>
          {'\u2022'} Secondary gaps: job progress photos in portal, branded measurement reports, rate limiting.
        </Text>

        <PageFooter pageNum={1} totalPages={4} />
      </Page>

      {/* PAGE 2-4: Detail tables */}
      {[
        { pageNum: 2, sectionIndices: [0, 1] },
        { pageNum: 3, sectionIndices: [2, 3] },
        { pageNum: 4, sectionIndices: [4, 5] },
      ].map(({ pageNum, sectionIndices }) => (
        <Page key={pageNum} size="LETTER" style={styles.page}>
          {sectionIndices.map((si) => {
            const section = sections[si];
            return (
              <View key={section.title}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colFeature]}>Requirement</Text>
                  <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
                  <Text style={[styles.tableHeaderText, styles.colNotes]}>Notes</Text>
                </View>
                {section.items.map((item, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.colFeature}>{item.feature}</Text>
                    <View style={styles.colStatus}>
                      <StatusBadge status={item.status} />
                    </View>
                    <Text style={[styles.colNotes, { color: BRAND.gray }]}>{item.notes}</Text>
                  </View>
                ))}
              </View>
            );
          })}
          <PageFooter pageNum={pageNum} totalPages={4} />
        </Page>
      ))}
    </Document>
  );
}
