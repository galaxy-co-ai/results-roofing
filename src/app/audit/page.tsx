import type { Metadata } from 'next';
import s from './page.module.css';

export const metadata: Metadata = {
  title: 'Data Flow Audit',
  robots: { index: false, follow: false },
};

/* ========================================
   Tiny inline SVG components (no lucide dep needed)
   ======================================== */

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="8" />
      <path d="M6 9l2 2 4-4" />
    </svg>
  );
}

/* ========================================
   PAGE
   ======================================== */

const NAV_ITEMS = [
  { id: 'summary', label: 'Summary' },
  { id: 'collection', label: 'Collection' },
  { id: 'schema', label: 'Schema' },
  { id: 'outbound', label: 'Outbound' },
  { id: 'contracts', label: 'Integrations' },
  { id: 'pii', label: 'PII' },
  { id: 'validation', label: 'Validation' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'testing', label: 'Testing' },
  { id: 'findings', label: 'Findings' },
];

export default function AuditPage() {
  return (
    <div className={s.page}>
      {/* Header */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <h1 className={s.headerTitle}>Results Roofing — Data Flow Audit</h1>
          <div className={s.headerMeta}>
            <span className={`${s.badge} ${s.badgeClean}`}>
              <span className={s.badgeDot} />
              Complete
            </span>
            <span>March 4, 2026</span>
            <span>All E2E tests passing</span>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={s.navLink}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className={s.content}>

        {/* 0. Executive Summary */}
        <section id="summary" className={s.section} style={{ background: 'transparent', border: 'none' }}>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}>
              <p className={s.summaryLabel}>Status</p>
              <p className={s.summaryValueSmall}>
                <span className={`${s.badge} ${s.badgeClean}`}>
                  <span className={s.badgeDot} />
                  All flows verified
                </span>
              </p>
            </div>
            <div className={s.summaryCard}>
              <p className={s.summaryLabel}>Data Flows</p>
              <p className={s.summaryValue}>10</p>
            </div>
            <div className={s.summaryCard}>
              <p className={s.summaryLabel}>E2E Tests</p>
              <p className={s.summaryValue}>30/30</p>
            </div>
            <div className={s.summaryCard}>
              <p className={s.summaryLabel}>Findings</p>
              <p className={s.summaryValueSmall}>
                <span className={`${s.badge} ${s.badgeFlagged}`}>
                  <span className={s.badgeDot} />
                  1 Medium
                </span>{' '}
                <span className={`${s.badge} ${s.badgeInfo}`}>
                  <span className={s.badgeDot} />
                  3 Low
                </span>{' '}
                <span className={`${s.badge} ${s.badgeClean}`}>
                  <span className={s.badgeDot} />
                  1 Info
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 1. Data Collection Points */}
        <details id="collection" className={s.section} open>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>1</span>
            <span className={s.sectionTitle}>Data Collection Points</span>
          </summary>
          <div className={s.sectionBody}>
            {/* 1A */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Hero Address Form (Homepage)</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/quotes</code> — User enters address, clicks &quot;Get my quote&quot;
              </p>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr><th>Field</th><th>Source</th><th>Stored In</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><code>streetAddress</code></td><td>Mapbox autocomplete</td><td><code>leads.address</code>, <code>quotes.address</code></td></tr>
                    <tr><td><code>city</code></td><td>Mapbox autocomplete</td><td><code>leads.city</code>, <code>quotes.city</code></td></tr>
                    <tr><td><code>state</code></td><td>Mapbox autocomplete</td><td><code>leads.state</code>, <code>quotes.state</code></td></tr>
                    <tr><td><code>zip</code></td><td>Mapbox autocomplete</td><td><code>leads.zip</code>, <code>quotes.zip</code></td></tr>
                    <tr><td><code>lat</code> / <code>lng</code></td><td>Mapbox autocomplete</td><td><code>leads.lat</code>, <code>leads.lng</code></td></tr>
                  </tbody>
                </table>
              </div>
              <p className={s.prose}>After storage: Lead + Quote created → Google Solar API called (background) → pricing recalculated from measurement.</p>
            </div>

            {/* 1B */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Property Confirmation (Step 2)</h3>
                <span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />No new data</span>
              </div>
              <p className={s.prose}>Displays satellite image and estimated sqft. Sets <code>propertyConfirmed: true</code> in XState context. No API call.</p>
            </div>

            {/* 1C */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Package Selection (Step 3)</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/quotes/[id]/select-tier</code> — Good / Better / Best
              </p>
              <p className={s.prose}>Stores <code>quotes.selectedTier</code>, calculates <code>totalPrice</code> and <code>depositAmount</code>, sets status to <code>selected</code>.</p>
            </div>

            {/* 1D */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Schedule (Step 4)</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/quote-v2/[id]/checkpoint</code>
              </p>
              <p className={s.prose}>Date + time slot stored in <code>quotes.wizardCheckpoint</code> (JSONB), persisted to final columns on finalization.</p>
            </div>

            {/* 1E */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Contact Info (Step 5)</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>Checkpoint + finalize</p>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Field</th><th>Validation</th><th>Stored In</th></tr></thead>
                  <tbody>
                    <tr><td><code>phone</code></td><td>Stripped to digits, must be 10</td><td><code>leads.phone</code></td></tr>
                    <tr><td><code>email</code></td><td>Regex validation</td><td><code>leads.email</code></td></tr>
                    <tr><td><code>smsConsent</code></td><td>Checkbox (optional)</td><td><code>smsConsents</code> table</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1F */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Payment (Step 6)</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/payments/create-intent</code> → Stripe Elements
              </p>
              <p className={s.prose}>Card data <strong>never touches our server</strong> — PCI-compliant Stripe Elements iframe. Only <code>cardLast4</code> and <code>cardBrand</code> stored from webhook.</p>
              <p className={s.prose}>On success: orders + payments + invoices created → Resend email → GHL contact sync → GA4 + Meta CAPI conversion events.</p>
            </div>

            {/* 1G */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Contact Form</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/contact</code> — 3-step form: service type → address → contact info
              </p>
              <p className={s.prose}>Creates lead with <code>utmSource: &apos;contact_form&apos;</code>. Fields: serviceType, address, city, state, zip, name, phone, email, message.</p>
            </div>

            {/* 1H */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Out-of-Area Lead Capture</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/leads/out-of-area</code>
              </p>
              <p className={s.prose}>Captures email, zip, state, IP, and user agent for expansion marketing.</p>
            </div>

            {/* 1I */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Save &amp; Resume</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/quote-v2/[id]/save-draft</code>
              </p>
              <p className={s.prose}>Email captured → resume token generated (32-char, 30-day expiry) → Resend sends deep link.</p>
            </div>

            {/* 1J */}
            <div className={s.flowCard}>
              <div className={s.flowCardHeader}>
                <h3 className={s.flowCardTitle}>Deposit Authorization (Contract Signing)</h3>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Verified</span>
              </div>
              <p className={s.flowCardMeta}>
                <code>POST /api/quotes/[id]/deposit-auth</code>
              </p>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Field</th><th>Source</th><th>Stored In</th></tr></thead>
                  <tbody>
                    <tr><td><code>signature</code></td><td>Signature pad (text)</td><td><code>contracts.signatureText</code></td></tr>
                    <tr><td><code>email</code></td><td>Text input</td><td><code>contracts.customerEmail</code></td></tr>
                    <tr><td><code>signatureIp</code></td><td>Request headers</td><td><code>contracts.signatureIp</code></td></tr>
                    <tr><td><code>signatureUserAgent</code></td><td>Request headers</td><td><code>contracts.signatureUserAgent</code></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>

        {/* 2. Database Schema */}
        <details id="schema" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>2</span>
            <span className={s.sectionTitle}>Database Schema</span>
          </summary>
          <div className={s.sectionBody}>
            <h4 className={s.subTitle}>Core Flow Tables</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Table</th><th>Purpose</th><th>Key Columns</th><th>PII</th></tr></thead>
                <tbody>
                  <tr><td><code>leads</code></td><td>Customer contact records</td><td>email, phone, name, address, lat/lng, UTMs</td><td><span className={`${s.badge} ${s.badgeFlagged}`}><span className={s.badgeDot} />Yes</span></td></tr>
                  <tr><td><code>quotes</code></td><td>Quote lifecycle</td><td>address, sqft, tier, pricing, schedule, checkpoint</td><td><span className={`${s.badge} ${s.badgeFlagged}`}><span className={s.badgeDot} />Address</span></td></tr>
                  <tr><td><code>measurements</code></td><td>Roof measurement data</td><td>sqft, pitch, ridge/valley/eave/hip, vendor, GAF assets</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />No</span></td></tr>
                  <tr><td><code>contracts</code></td><td>E-signature records</td><td>signature, signedAt, signatureIp, PDF URL + hash</td><td><span className={`${s.badge} ${s.badgeFlagged}`}><span className={s.badgeDot} />Yes</span></td></tr>
                  <tr><td><code>orders</code></td><td>Confirmed orders</td><td>confirmationNumber, customer info, pricing, schedule</td><td><span className={`${s.badge} ${s.badgeFlagged}`}><span className={s.badgeDot} />Yes</span></td></tr>
                  <tr><td><code>payments</code></td><td>Payment records</td><td>amount, Stripe IDs, cardLast4, status</td><td><span className={`${s.badge} ${s.badgeFlagged}`}><span className={s.badgeDot} />Card info</span></td></tr>
                  <tr><td><code>invoices</code></td><td>Invoice lifecycle</td><td>invoiceNumber, amount, GHL IDs, status</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />No</span></td></tr>
                </tbody>
              </table>
            </div>

            <h4 className={s.subTitle}>Supporting Tables</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
                <tbody>
                  <tr><td><code>quoteDrafts</code></td><td>Resume tokens + draft state (30-day expiry)</td></tr>
                  <tr><td><code>quoteShares</code></td><td>Shareable quote links with view tracking</td></tr>
                  <tr><td><code>smsConsents</code></td><td>TCPA-compliant SMS consent records</td></tr>
                  <tr><td><code>outOfAreaLeads</code></td><td>Email capture for expansion marketing</td></tr>
                  <tr><td><code>appointments</code></td><td>Scheduled inspections/installations</td></tr>
                  <tr><td><code>documents</code></td><td>Document lifecycle tracking</td></tr>
                  <tr><td><code>webhookEvents</code></td><td>Audit trail for all inbound webhooks</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* 3. Outbound Data Destinations */}
        <details id="outbound" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>3</span>
            <span className={s.sectionTitle}>Outbound Data Destinations</span>
          </summary>
          <div className={s.sectionBody}>
            {/* Resend */}
            <h4 className={s.subTitle}>Resend (Transactional Email)</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Template</th><th>Trigger</th><th>Data Sent</th></tr></thead>
                <tbody>
                  <tr><td><code>quote_ready</code></td><td>Measurement complete</td><td>quoteId, quoteUrl</td></tr>
                  <tr><td><code>quote_resume</code></td><td>Save &amp; resume</td><td>address, resumeUrl, expiresAt</td></tr>
                  <tr><td><code>payment_confirmation</code></td><td>Payment succeeded</td><td>customerName, amount, confirmationNumber</td></tr>
                  <tr><td><code>booking_confirmation</code></td><td>Appointment booked</td><td>customerName, date, address</td></tr>
                  <tr><td><code>signature_request</code></td><td>Contract ready</td><td>customerName, signatureUrl</td></tr>
                  <tr><td><code>invoice_ready</code></td><td>Balance due</td><td>customerName, invoiceNumber, amount</td></tr>
                </tbody>
              </table>
            </div>

            {/* GHL */}
            <h4 className={s.subTitle}>GoHighLevel (CRM + Messaging)</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Action</th><th>Trigger</th><th>Data Sent</th></tr></thead>
                <tbody>
                  <tr><td>Create/update contact</td><td>Payment success</td><td>name, email, phone, address, tags</td></tr>
                  <tr><td>Create opportunity</td><td>Invoice synced</td><td>pipelineStageId, contactId, monetaryValue</td></tr>
                  <tr><td>Send SMS</td><td>Booking/payment/contract events</td><td>phone, templated message</td></tr>
                  <tr><td>Update pipeline stage</td><td>Invoice status changes</td><td>stageId progression</td></tr>
                </tbody>
              </table>
            </div>

            {/* Stripe */}
            <h4 className={s.subTitle}>Stripe (Payments)</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Action</th><th>Trigger</th><th>Data Sent</th></tr></thead>
                <tbody>
                  <tr><td>Create customer</td><td>First payment</td><td>email, name, lead_id</td></tr>
                  <tr><td>Create payment intent</td><td>Checkout</td><td>amount, currency, customer, metadata</td></tr>
                </tbody>
              </table>
            </div>

            {/* Analytics */}
            <h4 className={s.subTitle}>Analytics (GA4 + Meta CAPI)</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Event</th><th>Trigger</th><th>Meta Event</th></tr></thead>
                <tbody>
                  <tr><td><code>quote_started</code></td><td>Address entered</td><td>Lead</td></tr>
                  <tr><td><code>address_entered</code></td><td>Address confirmed</td><td>InitiateCheckout</td></tr>
                  <tr><td><code>package_selected</code></td><td>Tier chosen</td><td>AddToCart</td></tr>
                  <tr><td><code>deposit_paid</code></td><td>Payment succeeded</td><td>Purchase</td></tr>
                </tbody>
              </table>
            </div>

            {/* GAF */}
            <h4 className={s.subTitle}>GAF QuickMeasure (Roof Measurement)</h4>
            <p className={s.prose}>Outbound: address + lat/lng + quoteId. Inbound webhook: sqft, pitch, ridge/valley/eave/hip lengths. Report PDFs stored in Vercel Blob Storage. Processing time: ~1 hour.</p>
          </div>
        </details>

        {/* 4. Integration Contract Map */}
        <details id="contracts" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>4</span>
            <span className={s.sectionTitle}>Integration Contract Map</span>
          </summary>
          <div className={s.sectionBody}>
            {/* Stripe */}
            <div className={s.integrationCard}>
              <div className={s.integrationHeader}>
                <h4 className={s.integrationTitle}>Stripe</h4>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Active</span>
              </div>
              <div className={s.integrationMeta}>
                <span className={s.metaTag}>STRIPE_SECRET_KEY</span>
                <span className={s.metaTag}>STRIPE_WEBHOOK_SECRET</span>
                <span className={s.metaTag}>API 2025-02-24.acacia</span>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Function</th><th>Endpoint</th><th>Payload → DB</th></tr></thead>
                  <tbody>
                    <tr><td><code>getOrCreateStripeCustomer()</code></td><td><code>POST /v1/customers</code></td><td>email, name → <code>leads.stripeCustomerId</code></td></tr>
                    <tr><td><code>createPaymentIntent</code></td><td><code>POST /v1/payment_intents</code></td><td>amount, currency, metadata → Stripe-hosted</td></tr>
                    <tr><td>Webhook: <code>payment_intent.succeeded</code></td><td>Inbound</td><td>→ orders + payments + invoices</td></tr>
                    <tr><td>Webhook: <code>charge.refunded</code></td><td>Inbound</td><td>→ <code>payments.status</code> → refunded</td></tr>
                  </tbody>
                </table>
              </div>
              <p className={s.prose}>Side effects on payment success: Resend email, GHL SMS, GHL contact sync, GHL opportunity, balance invoice auto-generated.</p>
            </div>

            {/* GAF */}
            <div className={s.integrationCard}>
              <div className={s.integrationHeader}>
                <h4 className={s.integrationTitle}>GAF QuickMeasure</h4>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Active</span>
              </div>
              <div className={s.integrationMeta}>
                <span className={s.metaTag}>OAuth2 via Okta</span>
                <span className={s.metaTag}>GAF_CLIENT_ID</span>
                <span className={s.metaTag}>GAF_CLIENT_SECRET</span>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Function</th><th>Endpoint</th><th>Payload → DB</th></tr></thead>
                  <tbody>
                    <tr><td><code>placeOrder()</code></td><td><code>POST /order</code></td><td>address, lat/lng → <code>measurements.gafOrderNumber</code></td></tr>
                    <tr><td><code>checkCoverage()</code></td><td><code>GET /coverageCheck</code></td><td>lat/lng → boolean (not stored)</td></tr>
                    <tr><td>Webhook callback</td><td>Inbound</td><td>sqft, pitch, lengths → <code>measurements</code></td></tr>
                    <tr><td><code>downloadAsset()</code></td><td><code>GET /download/&#123;filename&#125;</code></td><td>PDF → Vercel Blob → <code>measurements.gafAssets</code></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GHL */}
            <div className={s.integrationCard}>
              <div className={s.integrationHeader}>
                <h4 className={s.integrationTitle}>GoHighLevel</h4>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Active</span>
              </div>
              <div className={s.integrationMeta}>
                <span className={s.metaTag}>GHL_API_KEY</span>
                <span className={s.metaTag}>GHL_WEBHOOK_SECRET</span>
                <span className={s.metaTag}>100 req/10s</span>
              </div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Function</th><th>Endpoint</th><th>Payload → DB</th></tr></thead>
                  <tbody>
                    <tr><td><code>upsertContact()</code></td><td><code>POST /contacts/upsert</code></td><td>email, phone, name, tags → <code>leads.jobnimbusContactId</code></td></tr>
                    <tr><td><code>sendSMS()</code></td><td><code>POST /conversations/messages</code></td><td>contactId, message → GHL only</td></tr>
                    <tr><td><code>createOpportunity()</code></td><td><code>POST /opportunities</code></td><td>pipelineId, stageId, monetaryValue → <code>invoices.ghlOpportunityId</code></td></tr>
                  </tbody>
                </table>
              </div>
              <p className={s.prose}>Pipeline stages: Quote → Scheduled → In Progress → Completed (or Cancelled).</p>
            </div>

            {/* Resend */}
            <div className={s.integrationCard}>
              <div className={s.integrationHeader}>
                <h4 className={s.integrationTitle}>Resend</h4>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Active</span>
              </div>
              <div className={s.integrationMeta}>
                <span className={s.metaTag}>RESEND_API_KEY</span>
                <span className={s.metaTag}>Fire-and-forget</span>
              </div>
              <p className={s.prose}>9 email templates. No DB storage — Resend handles delivery tracking. From: <code>RESEND_FROM_EMAIL</code>.</p>
            </div>

            {/* Google Solar */}
            <div className={s.integrationCard}>
              <div className={s.integrationHeader}>
                <h4 className={s.integrationTitle}>Google Solar API</h4>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Active</span>
              </div>
              <div className={s.integrationMeta}>
                <span className={s.metaTag}>GOOGLE_SOLAR_API_KEY</span>
                <span className={s.metaTag}>~$0.075/req</span>
              </div>
              <p className={s.prose}><code>fetchSolarMeasurement()</code> — lat/lng → sqft, pitch, complexity, confidence. Transforms: m² → sqft, degrees → roof pitch. 95%+ US coverage.</p>
            </div>

            {/* Deprecated */}
            <h4 className={s.subTitle}>Deprecated / Migrated</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Adapter</th><th>Status</th><th>Now Routes To</th></tr></thead>
                <tbody>
                  <tr><td>JobNimbus</td><td><span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />Migrated</span></td><td>GHL (wrapper functions)</td></tr>
                  <tr><td>SignalWire</td><td><span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />Deprecated</span></td><td>GHL SMS</td></tr>
                  <tr><td>Wisetack</td><td><span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />Stub only</span></td><td>Enhancify (not implemented)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* 5. PII Inventory */}
        <details id="pii" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>5</span>
            <span className={s.sectionTitle}>PII Inventory</span>
          </summary>
          <div className={s.sectionBody}>
            <h4 className={s.subTitle}>Direct Customer PII (High Sensitivity)</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Data Type</th><th>Tables</th></tr></thead>
                <tbody>
                  <tr><td>Email</td><td>leads, orders, contracts, quoteDrafts, quoteShares, outOfAreaLeads, appointments, tickets, documents</td></tr>
                  <tr><td>Phone</td><td>leads, orders, smsConsents, appointments, tickets</td></tr>
                  <tr><td>Full Name</td><td>leads (first+last), orders (customerName), documents</td></tr>
                  <tr><td>Street Address</td><td>leads, quotes, orders, documents</td></tr>
                  <tr><td>Card Last 4</td><td>payments</td></tr>
                  <tr><td>Signature Text</td><td>contracts</td></tr>
                  <tr><td>IP Address</td><td>smsConsents, outOfAreaLeads, contracts, feedback</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className={s.subTitle}>External System Links</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Identifier</th><th>Table</th><th>Links To</th></tr></thead>
                <tbody>
                  <tr><td><code>clerkUserId</code></td><td>leads, quotes, orders</td><td>Clerk (auth)</td></tr>
                  <tr><td><code>stripeCustomerId</code></td><td>leads</td><td>Stripe (payment)</td></tr>
                  <tr><td><code>jobnimbusContactId</code></td><td>leads</td><td>GHL CRM</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* 6. Validation & Rate Limits */}
        <details id="validation" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>6</span>
            <span className={s.sectionTitle}>Validation Rules &amp; Rate Limits</span>
          </summary>
          <div className={s.sectionBody}>
            <h4 className={s.subTitle}>Validation Rules</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Data Point</th><th>Rule</th><th>Enforcement</th></tr></thead>
                <tbody>
                  <tr><td>Email</td><td>Must contain @, valid format</td><td>Zod <code>.email()</code> or regex</td></tr>
                  <tr><td>Phone</td><td>Exactly 10 digits after stripping</td><td>Manual check</td></tr>
                  <tr><td>State</td><td>Must be TX, GA, NC, AZ, or OK</td><td>AddressAutocomplete component</td></tr>
                  <tr><td>Tier</td><td>good | better | best</td><td>Zod <code>.enum()</code></td></tr>
                  <tr><td>Scheduled Date</td><td>Future, excludes Sundays</td><td>Manual check</td></tr>
                  <tr><td>Signature</td><td>Min 3 characters</td><td>Zod <code>.min(3)</code></td></tr>
                  <tr><td>agreedToTerms</td><td>Must be true</td><td>Zod <code>.literal(true)</code></td></tr>
                  <tr><td>Quote Expiry</td><td>30 days from creation</td><td><code>expiresAt</code> column</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className={s.subTitle}>Rate Limits</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Endpoint</th><th>Limit</th><th>Identifier</th></tr></thead>
                <tbody>
                  <tr><td><code>POST /api/quotes</code></td><td>10/min</td><td>IP</td></tr>
                  <tr><td><code>POST /api/contact</code></td><td>5/min</td><td>IP</td></tr>
                  <tr><td><code>POST /api/leads/out-of-area</code></td><td>5/min</td><td>IP</td></tr>
                  <tr><td><code>POST /api/quotes/[id]/*</code></td><td>10/min</td><td>IP</td></tr>
                  <tr><td><code>POST /api/payments/create-intent</code></td><td>Per IP</td><td>IP</td></tr>
                  <tr><td><code>POST /api/quotes/[id]/deposit-auth</code></td><td>10/min</td><td>IP</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className={s.subTitle}>Data Retention</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Data</th><th>Lifetime</th><th>Policy</th></tr></thead>
                <tbody>
                  <tr><td>Quotes</td><td>30 days (unless converted)</td><td>Not auto-deleted</td></tr>
                  <tr><td>Resume Tokens</td><td>30 days</td><td>Checked on use</td></tr>
                  <tr><td>Orders / Payments / Invoices</td><td>Indefinite</td><td>Financial/legal</td></tr>
                  <tr><td>Contracts</td><td>Indefinite</td><td>Legal record</td></tr>
                  <tr><td>SMS Consents</td><td>Indefinite</td><td>TCPA compliance</td></tr>
                  <tr><td>Webhook Events</td><td>Indefinite</td><td>Audit trail</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* 7. Compliance */}
        <details id="compliance" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>7</span>
            <span className={s.sectionTitle}>Compliance (TCPA / E-Sign / PCI)</span>
          </summary>
          <div className={s.sectionBody}>
            <div className={s.flowCard}>
              <h4 className={s.flowCardTitle}>TCPA (SMS Consent)</h4>
              <ul className={s.checkList}>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Exact consent text captured</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Consent boolean recorded</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Source tracked (web_form, checkout_form, checkout_finalize)</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />IP + User Agent captured at consent</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Opt-out tracking (optedOutAt, optOutSource)</li>
              </ul>
            </div>

            <div className={s.flowCard}>
              <h4 className={s.flowCardTitle}>E-Signature (ESIGN Act)</h4>
              <ul className={s.checkList}>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Signature text (typed) stored</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Timestamp of signing (signedAt)</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />IP address at signing</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />User agent at signing</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Terms version (templateVersion)</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Signed PDF URL + hash for integrity</li>
              </ul>
            </div>

            <div className={s.flowCard}>
              <h4 className={s.flowCardTitle}>Payment Security (PCI DSS)</h4>
              <ul className={s.checkList}>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Card data never touches our servers</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Stripe Elements (PCI DSS Level 1)</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Only cardLast4 + cardBrand stored</li>
                <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Webhook signature verified on every event</li>
              </ul>
            </div>
          </div>
        </details>

        {/* 8. Verification & Testing */}
        <details id="testing" className={s.section}>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>8</span>
            <span className={s.sectionTitle}>Verification &amp; Testing</span>
          </summary>
          <div className={s.sectionBody}>
            <h4 className={s.subTitle}>E2E Test Suite</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Category</th><th>Tests</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Entry &amp; Address Step</td><td>4</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td>V1 → V2 Redirect</td><td>1</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td>Layout &amp; Structure</td><td>3</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td>Accessibility</td><td>2</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td>Out-of-Area Rejection</td><td>1</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td>Contact Form</td><td>1</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td>Page Navigation</td><td>3</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Passing</span></td></tr>
                  <tr><td><strong>Total</strong></td><td><strong>15 × 2 browsers</strong></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />30/30</span></td></tr>
                </tbody>
              </table>
            </div>
            <p className={s.prose}>Browser coverage: Desktop Chrome + Mobile Chrome (Pixel 5 viewport).</p>

            <h4 className={s.subTitle}>Data Flow Verification</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Flow</th><th>Entry</th><th>API</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Quote creation</td><td>Hero form</td><td><code>POST /api/quotes</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Property confirmation</td><td>V2 step 2</td><td>Checkpoint</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Package selection</td><td>V2 step 3</td><td><code>POST .../select-tier</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Schedule</td><td>V2 step 4</td><td>Checkpoint</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Contact info</td><td>V2 step 5</td><td>Checkpoint + finalize</td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Payment</td><td>V2 step 6</td><td><code>POST .../create-intent</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Contact form</td><td>/contact</td><td><code>POST /api/contact</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Out-of-area</td><td>Address entry</td><td><code>POST .../out-of-area</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Save &amp; resume</td><td>V2 wizard</td><td><code>POST .../save-draft</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                  <tr><td>Contract signing</td><td>Checkout</td><td><code>POST .../deposit-auth</code></td><td><span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />✓</span></td></tr>
                </tbody>
              </table>
            </div>

            <h4 className={s.subTitle}>Pre-Ship Fixes Applied</h4>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Issue</th><th>Fix</th><th>Commit</th></tr></thead>
                <tbody>
                  <tr><td>4 fake phone numbers (555-xxxx)</td><td>Replaced with 1-800-RESULTS</td><td><code>4e1b07b</code></td></tr>
                  <tr><td>Map placeholder on contact/about pages</td><td>Mapbox static DFW embed</td><td><code>4714d1d</code></td></tr>
                  <tr><td>All links pointed to V1 /quote/new</td><td>Updated + 301 redirect</td><td><code>5b1a06e</code></td></tr>
                  <tr><td>Unused import causing lint error</td><td>Removed from save-draft route</td><td><code>de42d70</code></td></tr>
                  <tr><td>V2 had zero E2E coverage</td><td>15-test suite (30 across 2 projects)</td><td><code>4714d1d</code></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* 9. Findings & Recommendations */}
        <details id="findings" className={s.section} open>
          <summary className={s.sectionHeader}>
            <ChevronRight className={s.sectionChevron} />
            <span className={s.sectionNumber}>9</span>
            <span className={s.sectionTitle}>Findings &amp; Recommendations</span>
          </summary>
          <div className={s.sectionBody}>
            <h4 className={s.subTitle}>Clean</h4>
            <ul className={s.checkList}>
              <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />All form fields map to specific database columns — no orphaned data</li>
              <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />All API routes have proper validation (Zod or manual)</li>
              <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />Rate limiting on all public-facing endpoints</li>
              <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />TCPA compliance properly implemented</li>
              <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />PCI handled correctly (Stripe Elements, no raw card data)</li>
              <li className={s.checkItem}><CheckCircle className={`${s.checkIcon} ${s.checkPass}`} />E-signature audit trail complete</li>
            </ul>

            <h4 className={s.subTitle}>Flagged for Review</h4>

            <div className={`${s.findingCard} ${s.findingMedium}`}>
              <p className={s.findingTitle}>
                <span className={`${s.badge} ${s.badgeFlagged}`}><span className={s.badgeDot} />Medium</span>
                PII in application logs
              </p>
              <p className={s.findingBody}>
                Email, phone, name, and address logged at INFO level in payment webhook handler, GHL adapter, and Resend adapter. Add PII masking to logger (hash emails, truncate phones) before production log aggregation.
              </p>
            </div>

            <div className={`${s.findingCard} ${s.findingLow}`}>
              <p className={s.findingTitle}>
                <span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />Low</span>
                GAF report PDFs in public Vercel Blob
              </p>
              <p className={s.findingBody}>
                <code>access: &apos;public&apos;</code> on uploaded measurement reports. Verify PDFs contain only roof measurements (no homeowner PII). Consider <code>access: &apos;private&apos;</code> with signed URLs.
              </p>
            </div>

            <div className={`${s.findingCard} ${s.findingLow}`}>
              <p className={s.findingTitle}>
                <span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />Low</span>
                No automatic quote/draft cleanup
              </p>
              <p className={s.findingBody}>
                Expired quotes and drafts remain in DB indefinitely. Add scheduled cleanup job (cron) or soft-delete after 90 days.
              </p>
            </div>

            <div className={`${s.findingCard} ${s.findingInfo}`}>
              <p className={s.findingTitle}>
                <span className={`${s.badge} ${s.badgeClean}`}><span className={s.badgeDot} />Info</span>
                Address denormalized across 3 tables
              </p>
              <p className={s.findingBody}>
                <code>leads</code>, <code>quotes</code>, and <code>orders</code> all store full address independently. By design for query performance — no action needed, but be aware of update inconsistencies.
              </p>
            </div>

            <div className={`${s.findingCard} ${s.findingLow}`}>
              <p className={s.findingTitle}>
                <span className={`${s.badge} ${s.badgeInfo}`}><span className={s.badgeDot} />Low</span>
                Out-of-area leads — no unsubscribe mechanism
              </p>
              <p className={s.findingBody}>
                Email captured but no opt-out flow exists. Add unsubscribe link when expansion marketing emails are sent.
              </p>
            </div>
          </div>
        </details>

      </main>

      {/* Footer */}
      <footer className={s.footer}>
        Generated and verified as part of the Results Roofing project close-out process. March 2026.
      </footer>
    </div>
  );
}
