# V1 Ship Sprint — Results Roofing

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all broken/stubbed/missing pieces blocking V1 launch — funnel bugs, missing integrations, placeholder data, and new GAF measurement system.

**Architecture:** Fix P0 funnel-breaking bugs first (parallel batch), then wire real data into stubbed UI (P1), then polish (P2). GAF integration is async submit → webhook → store → surface pattern. Documents use Vercel Blob for file storage.

**Tech Stack:** Next.js 14, Clerk Backend SDK, Stripe, GHL API, GAF API, Vercel Blob, Drizzle/Neon, Zod

---

## Batch 1 — P0: Broken (blocks the funnel)

All 4 tasks are independent. Execute in parallel.

---

### Task 1: Fix portal orders API ownership check

**Files:**
- Modify: `src/app/api/portal/orders/[id]/route.ts:42-49`

**Step 1: Add ownership guard after order fetch**

In the GET handler, after the `if (!order)` check (~line 48), add:

```ts
if (order.clerkUserId !== userId) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

Return 404 (not 403) to avoid leaking that the order exists.

**Step 2: Verify the order schema has `clerkUserId`**

Check `src/db/schema/orders.ts` — confirm the column exists. If orders link through leads instead, use: fetch lead by `order.leadId`, check `lead.clerkUserId === userId`.

**Step 3: Test manually** — hit the endpoint with a mismatched userId and confirm 404.

**Step 4: Commit**

```bash
git add src/app/api/portal/orders/[id]/route.ts
git commit -m "fix: add ownership check to portal order detail API"
```

---

### Task 2: Fix hardcoded schedule date picker

**Files:**
- Modify: `src/components/features/quote/stages/Stage3/ScheduleContainer.tsx:75`

**Step 1: Replace hardcoded date with dynamic computation**

Change line 75 from:
```ts
const currentDate = new Date(2026, 1, 3);
```
To:
```ts
// Start from tomorrow, advance to next weekday if needed
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const day = tomorrow.getDay();
if (day === 0) tomorrow.setDate(tomorrow.getDate() + 1); // Sun → Mon
if (day === 6) tomorrow.setDate(tomorrow.getDate() + 2); // Sat → Mon
const currentDate = tomorrow;
```

**Step 2: Verify `getAvailableDates` still works** — it generates 10 weekdays from this seed. Dynamic seed should produce correct future dates.

**Step 3: Commit**

```bash
git add src/components/features/quote/stages/Stage3/ScheduleContainer.tsx
git commit -m "fix: compute schedule dates dynamically instead of hardcoded Feb 2026"
```

---

### Task 3: Fix PDF receipt placeholder details

**Files:**
- Modify: `src/lib/pdf/receipt-template.tsx:167-171`

**Step 1: Replace hardcoded COMPANY object with env-backed config**

```ts
const COMPANY = {
  name: 'Results Roofing',
  phone: process.env.COMPANY_PHONE || '(512) 555-0199',
  email: process.env.COMPANY_EMAIL || 'info@resultsroofing.com',
  license: process.env.COMPANY_LICENSE || 'TX License #XXXXXX',
};
```

**Step 2: Add env vars to `.env.local`**

```
COMPANY_PHONE=<real phone>
COMPANY_EMAIL=info@resultsroofing.com
COMPANY_LICENSE=<real TX license number>
```

**Step 3: Add to `.env.example` with `[REQUIRED]` label**

**Step 4: Commit**

```bash
git add src/lib/pdf/receipt-template.tsx .env.example
git commit -m "fix: use env vars for company details in PDF receipts"
```

---

### Task 4: Add Clerk account creation after quote confirmation

**Files:**
- Modify: `src/app/api/quotes/[id]/confirm/route.ts`
- Reference: `src/middleware.ts` (no changes needed — portal routes already Clerk-protected)

**Step 1: Install Clerk Backend SDK if not present**

Check `package.json` for `@clerk/nextjs` — it should already include backend methods via `import { clerkClient } from '@clerk/nextjs/server'`.

**Step 2: After lead update, create or find Clerk user**

After the existing lead update block (~line 84), add:

```ts
// Create Clerk account so user can access portal
try {
  const clerk = await clerkClient();

  // Check if user already exists by email
  const existingUsers = await clerk.users.getUserList({
    emailAddress: [validatedData.email],
  });

  let clerkUserId: string;

  if (existingUsers.data.length > 0) {
    clerkUserId = existingUsers.data[0].id;
  } else {
    const newUser = await clerk.users.createUser({
      emailAddress: [validatedData.email],
      firstName: validatedData.fullName.split(' ')[0],
      lastName: validatedData.fullName.split(' ').slice(1).join(' ') || undefined,
    });
    clerkUserId = newUser.id;
  }

  // Link Clerk user to lead
  await db.update(leads)
    .set({ clerkUserId })
    .where(eq(leads.id, quote.leadId));
} catch (clerkError) {
  // Log but don't block — user can still sign up manually
  console.error('Clerk account creation failed:', clerkError);
}
```

**Step 3: Update redirect URL in the response** — ensure it points to `/portal` (not `/portal/dashboard`).

**Step 4: Test** — submit a quote confirmation, check Clerk dashboard for new user, verify portal access.

**Step 5: Commit**

```bash
git add src/app/api/quotes/[id]/confirm/route.ts
git commit -m "feat: create Clerk account on quote confirmation for portal access"
```

---

## Batch 2 — P1: Quick Wins

All independent. Execute in parallel after Batch 1.

---

### Task 5: Wire PhaseShell into portal page

**Files:**
- Modify: `src/app/portal/page.tsx:111-115`

**Step 1: Import PhaseShell**

```ts
import { PhaseShell } from '@/components/features/portal/PhaseShell/PhaseShell';
```

**Step 2: Replace the stub placeholder**

Replace:
```tsx
{(phase?.phase === PortalPhase.IN_PROGRESS || phase?.phase === PortalPhase.COMPLETE) && (
  <div className={styles.shellPlaceholder}>
    <p>Phase {phase.phase} content coming soon.</p>
  </div>
)}
```

With:
```tsx
{phase?.phase === PortalPhase.IN_PROGRESS && (
  <PhaseShell phase="in-progress" page="project" />
)}
{phase?.phase === PortalPhase.COMPLETE && (
  <PhaseShell phase="complete" page="project" />
)}
```

**Step 3: Commit**

```bash
git add src/app/portal/page.tsx
git commit -m "feat: wire PhaseShell component into portal IN_PROGRESS and COMPLETE phases"
```

---

### Task 6: Wire GHL opportunities into JobNimbus adapter

**Files:**
- Modify: `src/lib/integrations/adapters/jobnimbus.ts`
- Reference: `src/lib/ghl/api/pipelines.ts` (already has `createOpportunity`, `updateOpportunityStatus`, `moveOpportunityToStage`)

**Step 1: Add env vars for pipeline/stage IDs**

Add to `.env.local`:
```
GHL_PIPELINE_ID=<pipeline id from GHL>
GHL_QUOTE_STAGE_ID=<stage id for new quotes>
GHL_CONTRACTED_STAGE_ID=<stage id for contracted>
GHL_IN_PROGRESS_STAGE_ID=<stage id for in progress>
GHL_COMPLETED_STAGE_ID=<stage id for completed>
```

**Step 2: Wire `createJob` to `createOpportunity`**

Replace the stub body with:
```ts
async createJob(data: { contactId: string; title: string; description?: string }) {
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const stageId = process.env.GHL_QUOTE_STAGE_ID;

  if (!pipelineId || !stageId) {
    logger.warn('GHL pipeline/stage IDs not configured, skipping job creation');
    return { id: `mock-${Date.now()}`, success: true };
  }

  const opp = await createOpportunity({
    name: data.title,
    pipelineId,
    stageId,
    contactId: data.contactId,
    status: 'open',
  });

  return { id: opp.id, success: true };
}
```

**Step 3: Wire `updateJobStatus` to `moveOpportunityToStage`**

Map status strings to stage IDs:
```ts
async updateJobStatus(jobId: string, status: string) {
  const stageMap: Record<string, string | undefined> = {
    quoted: process.env.GHL_QUOTE_STAGE_ID,
    contracted: process.env.GHL_CONTRACTED_STAGE_ID,
    in_progress: process.env.GHL_IN_PROGRESS_STAGE_ID,
    completed: process.env.GHL_COMPLETED_STAGE_ID,
  };

  const stageId = stageMap[status];
  if (!stageId) {
    logger.warn(`No GHL stage mapped for status: ${status}`);
    return { success: true };
  }

  await moveOpportunityToStage(jobId, stageId);
  return { success: true };
}
```

**Step 4: Wire `syncQuote` to update opportunity custom fields**

```ts
async syncQuote(quoteId: string, data: Record<string, unknown>) {
  // Update the opportunity with quote details as custom fields
  await updateOpportunity({
    id: quoteId,
    monetaryValue: data.totalPrice as number,
    // GHL custom fields can be added here as the pipeline matures
  });
  return { success: true };
}
```

**Step 5: Update imports** — add `createOpportunity`, `updateOpportunity`, `moveOpportunityToStage` from `@/lib/ghl/api/pipelines`.

**Step 6: Commit**

```bash
git add src/lib/integrations/adapters/jobnimbus.ts .env.local .env.example
git commit -m "feat: wire GHL opportunities API into JobNimbus adapter"
```

---

### Task 7: Clean up stale adapter comments + remove dead code

**Files:**
- Modify: `src/lib/integrations/adapters/index.ts`
- Modify: `src/lib/integrations/adapters/wisetack.ts`

**Step 1: Update index.ts status block** — mark jobnimbus as "Active (via GHL)", remove "STUB" label. Mark wisetack as "REMOVED — Enhancify TBD". Mark signalwire as "DEPRECATED — using GHL".

**Step 2: In `wisetack.ts`** — gut the mock implementations, replace with a single comment: `// Financing integration: migrating to Enhancify. Not yet implemented.`

**Step 3: In payments page** — update the financing card description from "Flexible payment plans through Wisetack" to "Flexible payment plans — coming soon".

**Step 4: Commit**

```bash
git add src/lib/integrations/adapters/index.ts src/lib/integrations/adapters/wisetack.ts src/app/portal/payments/page.tsx
git commit -m "chore: clean up stale adapter comments, remove Wisetack mocks"
```

---

### Task 8: Fix schedule page hardcoded strings

**Files:**
- Modify: `src/app/portal/schedule/page.tsx:51,58`

**Step 1: Replace hardcoded crew and time with conditional display**

```tsx
// Instead of hardcoded "Team Alpha — 4 person crew"
const crew = order?.crew || null;
const timeWindow = order?.timeWindow || '7:00 AM — 5:00 PM';
```

If the order schema doesn't have `crew`/`timeWindow` fields, just remove the crew line entirely and show a generic message: `"Your installation team details will be confirmed closer to your scheduled date."`

For time window, keep the default but make it clear it's standard: `"Standard installation window: 7:00 AM — 5:00 PM"`

**Step 2: Commit**

```bash
git add src/app/portal/schedule/page.tsx
git commit -m "fix: replace hardcoded crew/time with dynamic or honest defaults"
```

---

## Batch 3 — P1: Medium Lift (GAF + Documents)

Task 9 depends on GAF (Task 10) because GAF reports ARE the primary documents.
Execute Task 10 first, then Task 9 wires the results into the portal.

---

### Task 10: GAF QuickMeasure integration (adapter + webhook + order flow)

**Context:** GAF Digital Design API provides satellite roof measurement reports via an async order → callback pattern. Auth is Okta OAuth2 client_credentials. Reports take ~1 hour. Callback delivers full measurement data + downloadable PDF/image assets.

**Files:**
- Create: `src/lib/integrations/adapters/gaf.ts`
- Create: `src/lib/gaf/auth.ts` (Okta token management)
- Create: `src/app/api/webhooks/gaf/route.ts`
- Modify: `src/db/schema/measurements.ts` (add `gafOrderNumber`, `gafAssets` JSONB)
- Modify: `src/lib/integrations/adapters/index.ts`
- Modify: `src/app/api/quotes/route.ts` (fire GAF order on quote creation)

**Env vars to add to `.env.local`:**

```
# GAF Digital Design API (QuickMeasure)
GAF_OKTA_TOKEN_URL=https://ssoextdev.gaf.com/oauth2/auspzptrs3dd5LfUc0h7/v1/token
GAF_CLIENT_ID=<from Postman collection>
GAF_CLIENT_SECRET=<from Postman collection>
GAF_API_URL=https://gafapidev.gaf.com/partner/ZPR
GAF_SUBSCRIBER_NAME=ZPR
GAF_SUBSCRIBER_EMAIL=<accounting email>
GAF_WEBHOOK_CLIENT_ID=519f19c4983d463682c02a60cd93a270
GAF_WEBHOOK_CLIENT_SECRET=Df0f3b398Dd246E1bF9D78a9bF2Dfed0
GAF_PRODUCT_CODE=SF-QM-USA
```

**Step 1: Create Okta token manager**

```ts
// src/lib/gaf/auth.ts
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getGAFToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const params = new URLSearchParams({
    client_id: process.env.GAF_CLIENT_ID!,
    client_secret: process.env.GAF_CLIENT_SECRET!,
    grant_type: 'client_credentials',
    audience: process.env.GAF_API_URL!,
    scope: 'Subscriber:GetSubscriberDetails Subscriber:SiteStatus Subscriber:AccountCheck Subscriber:CoverageCheck Subscriber:OrderHistory Subscriber:OrderSearch Subscriber:Order Subscriber:Download',
  });

  const res = await fetch(process.env.GAF_OKTA_TOKEN_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params,
  });

  if (!res.ok) throw new Error(`GAF Okta auth failed: ${res.status}`);
  const data = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return cachedToken.token;
}
```

**Step 2: Create GAF adapter**

```ts
// src/lib/integrations/adapters/gaf.ts
import { getGAFToken } from '@/lib/gaf/auth';
import { z } from 'zod';

const GAF_API_URL = () => process.env.GAF_API_URL!;

export const gafAdapter = {
  isConfigured: () => Boolean(
    process.env.GAF_CLIENT_ID &&
    process.env.GAF_CLIENT_SECRET &&
    process.env.GAF_API_URL
  ),

  /** Check if address has satellite coverage */
  async checkCoverage(lat: number, lng: number) {
    const token = await getGAFToken();
    const res = await fetch(`${GAF_API_URL()}/coveragecheck`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productCode: process.env.GAF_PRODUCT_CODE || 'SF-QM-USA', latitude: lat, longitude: lng }),
    });
    return res.ok;
  },

  /** Place a QuickMeasure order — returns GAF order number */
  async placeOrder(data: {
    quoteId: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    fullAddress: string;
  }) {
    const token = await getGAFToken();
    const res = await fetch(`${GAF_API_URL()}/Order`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriberName: process.env.GAF_SUBSCRIBER_NAME,
        subscriberOrderNumber: `RR-${data.quoteId}`,
        subscriberCustomField1: data.quoteId,
        emailAddress: process.env.GAF_SUBSCRIBER_EMAIL,
        productCode: process.env.GAF_PRODUCT_CODE || 'SF-QM-USA',
        address1: data.address1,
        address2: data.address2 || '',
        city: data.city,
        stateOrProvince: data.state,
        postalCode: data.zip,
        country: 'USA',
        latitude: String(data.lat),
        longitude: String(data.lng),
        fullAddress: data.fullAddress,
        recipientEmailAddresses: process.env.GAF_SUBSCRIBER_EMAIL,
        ignoreCache: true,
        checkForDuplicate: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GAF Order failed: ${res.status} — ${text}`);
    }
    return await res.json();
  },

  /** Download a report asset by filename — returns Buffer */
  async downloadAsset(filename: string): Promise<Buffer> {
    const token = await getGAFToken();
    const res = await fetch(`${GAF_API_URL()}/download/${filename}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`GAF download failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  },

  /** Search for an order by GAF order number */
  async searchOrder(orderId: string) {
    const token = await getGAFToken();
    const res = await fetch(`${GAF_API_URL()}/OrderSearch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, subscriberOrderNumber: '' }),
    });
    if (!res.ok) throw new Error(`GAF OrderSearch failed: ${res.status}`);
    return await res.json();
  },
};
```

**Step 3: Create webhook handler**

The GAF callback POSTs to our URL with `client_id` and `client_secret` headers for auth.
Payload includes `RoofMeasurement` (area, facets, pitch, materials) + `Assets` (downloadable filenames).

```ts
// src/app/api/webhooks/gaf/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { measurements } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { gafAdapter } from '@/lib/integrations/adapters/gaf';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  // 1. Validate webhook auth
  const clientId = req.headers.get('client_id');
  const clientSecret = req.headers.get('client_secret');

  if (clientId !== process.env.GAF_WEBHOOK_CLIENT_ID ||
      clientSecret !== process.env.GAF_WEBHOOK_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse callback payload
  const payload = await req.json();
  const { SubscriberOrderNumber, GAFOrderNumber, RoofMeasurement, ProblemCode } = payload;

  // Extract our quoteId from SubscriberOrderNumber (format: "RR-{quoteId}")
  const quoteId = SubscriberOrderNumber?.replace('RR-', '');
  if (!quoteId) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

  // 3. Handle errors
  if (ProblemCode) {
    await db.update(measurements)
      .set({ status: 'failed', errorMessage: ProblemCode })
      .where(eq(measurements.quoteId, quoteId));
    return NextResponse.json({ received: true });
  }

  // 4. Download and store report assets in Vercel Blob
  const assets = RoofMeasurement?.Assets || {};
  const storedAssets: Record<string, string> = {};

  for (const [key, filename] of Object.entries(assets)) {
    if (typeof filename === 'string' && !filename.startsWith('http')) {
      try {
        const buffer = await gafAdapter.downloadAsset(filename as string);
        const blob = await put(`gaf/${quoteId}/${filename}`, buffer, {
          access: 'private',
          contentType: filename.endsWith('.pdf') ? 'application/pdf'
            : filename.endsWith('.jpg') ? 'image/jpeg'
            : 'application/octet-stream',
        });
        storedAssets[key] = blob.url;
      } catch (e) {
        console.error(`Failed to download GAF asset ${key}:`, e);
      }
    } else if (typeof filename === 'string') {
      storedAssets[key] = filename; // Already a URL (e.g., Report3D)
    }
  }

  // 5. Update measurement record
  await db.update(measurements)
    .set({
      status: 'complete',
      vendor: 'gaf',
      sqftTotal: RoofMeasurement?.Area ? String(RoofMeasurement.Area) : null,
      confidence: 'high',
      gafOrderNumber: String(GAFOrderNumber),
      gafAssets: storedAssets,
      rawResponse: payload,
      completedAt: new Date(),
    })
    .where(eq(measurements.quoteId, quoteId));

  // 6. Recalculate quote pricing with real sqft (if measurement has area)
  // TODO: Call calculateQuotePricing with new sqft and update quote record

  // 7. Notify customer that report is ready (via Resend)
  // TODO: Send email with link to portal documents

  return NextResponse.json({ received: true });
}
```

**Step 4: Add `gafOrderNumber` and `gafAssets` to measurements schema**

```ts
// In src/db/schema/measurements.ts, add:
gafOrderNumber: text('gaf_order_number'),
gafAssets: jsonb('gaf_assets').$type<Record<string, string>>(),
```

**Step 5: Fire GAF order during quote creation**

In `POST /api/quotes` (the main quote creation route), after the Google Solar fire-and-forget block, add:

```ts
// Fire GAF QuickMeasure order (async, ~1hr turnaround)
if (gafAdapter.isConfigured()) {
  gafAdapter.placeOrder({
    quoteId: newQuote.id,
    address1: validatedData.address,
    city: validatedData.city,
    state: validatedData.state,
    zip: validatedData.zip,
    lat: validatedData.lat,
    lng: validatedData.lng,
    fullAddress: `${validatedData.address}, ${validatedData.city}, ${validatedData.state} ${validatedData.zip}`,
  }).then(() => {
    // Create pending measurement record
    db.insert(measurements).values({
      quoteId: newQuote.id,
      vendor: 'gaf',
      status: 'pending',
    }).catch(console.error);
  }).catch(console.error);
}
```

**Step 6: Commit**

```bash
git add src/lib/gaf/ src/lib/integrations/adapters/gaf.ts src/app/api/webhooks/gaf/ src/db/schema/measurements.ts src/lib/integrations/adapters/index.ts .env.example
git commit -m "feat: add GAF QuickMeasure integration — order placement + webhook + Blob storage"
```

---

### Task 9: Wire documents page to real data (GAF reports + Vercel Blob)

**Depends on:** Task 10 (GAF adapter + Blob storage)

**Files:**
- Create: `src/app/api/portal/documents/route.ts`
- Modify: `src/app/portal/documents/page.tsx`
- Modify: `package.json` (add `@vercel/blob`)

**Step 1: Install Vercel Blob**

```bash
npm install @vercel/blob
```

Add `BLOB_READ_WRITE_TOKEN` to `.env.local` (from Vercel dashboard → Storage → Blob store named `results-roofing-docs`, **private** access).

**Step 2: Create documents API route**

Documents come from two sources: GAF measurement assets (stored in Blob) and any manually uploaded docs (contracts, warranties). The API reads the measurement's `gafAssets` field + the `documents` DB table.

```ts
// src/app/api/portal/documents/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents, measurements, orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getDownloadUrl } from '@vercel/blob';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  // Build document list from GAF assets + DB documents table
  const [order, measurement, manualDocs] = await Promise.all([
    db.select().from(orders).where(eq(orders.id, orderId)).then(r => r[0]),
    db.select().from(measurements).where(eq(measurements.quoteId, orderId)).then(r => r[0]),
    db.select().from(documents).where(eq(documents.orderId, orderId)),
  ]);

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const docList = [];

  // GAF report assets → document entries
  if (measurement?.gafAssets) {
    const assets = measurement.gafAssets as Record<string, string>;
    const assetMap: Record<string, { name: string; type: string }> = {
      Report: { name: 'GAF Roof Measurement Report', type: 'pdf' },
      HomeownerReport: { name: 'Homeowner Report', type: 'pdf' },
      Diagram: { name: 'Roof Diagram', type: 'pdf' },
      Cover: { name: 'Report Cover', type: 'pdf' },
    };

    for (const [key, url] of Object.entries(assets)) {
      if (assetMap[key] && url) {
        docList.push({
          id: `gaf-${key}`,
          name: assetMap[key].name,
          type: assetMap[key].type,
          url, // Blob URL — generate signed download URL on the fly
          source: 'gaf',
          createdAt: measurement.completedAt,
        });
      }
    }
  }

  // Manual documents from DB
  for (const doc of manualDocs) {
    docList.push({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      url: doc.url,
      source: 'manual',
      createdAt: doc.createdAt,
    });
  }

  return NextResponse.json({ documents: docList });
}
```

**Step 3: Update documents page** — replace hardcoded `DocumentsList` with `useQuery` fetch. Wire View/Download buttons to real URLs. Show GAF reports when measurement is complete, show "Measurement in progress" when pending.

**Step 4: Commit**

```bash
git add src/app/api/portal/documents/ src/app/portal/documents/page.tsx package.json package-lock.json .env.example
git commit -m "feat: wire documents page to GAF reports + Vercel Blob storage"
```

---

## Batch 4 — P2: Polish

---

### Task 11: Services page project gallery

**Files:**
- Modify: `src/app/services/page.tsx:485-528`

**Step 1:** Replace placeholder `<Home>` icon divs with real before/after project photos. Options:
- If photos exist: use `next/image` with Vercel Blob URLs
- If no photos yet: use a better placeholder (stock roofing photos via Unsplash, with a TODO to replace)

**Step 2: Commit**

```bash
git add src/app/services/page.tsx
git commit -m "feat: add project photos to services gallery"
```

---

## Batch 5 — V1.5: Branded Reports

---

### Task 12: Branded Results Roofing measurement report (replaces raw GAF PDF)

**Context:** GAF reports arrive GAF-branded with competitor info on the cover. Homeowners should never see GAF branding. We need a `@react-pdf/renderer` template that pulls GAF webhook data + diagram images into a Results Roofing branded PDF.

**GAF Report Structure (12 pages):**
| Page | Content | Action |
|------|---------|--------|
| 1 | Cover — GAF/contractor branding | **Replace** with RR branded cover |
| 2 | Overview — address, date, key measurements | **Rebrand** header/footer |
| 3 | Top View — satellite diagram | **Keep** image, rebrand frame |
| 4 | Side Views — N/E/S/W elevations | **Keep** images, rebrand frame |
| 5 | Lengths — per-segment ft | **Rebrand** as data table |
| 6 | Pitches — per-facet pitch | **Rebrand** as data table |
| 7 | Areas — per-facet sq ft | **Rebrand** as data table |
| 8 | Summary — measurements + waste table | **Rebrand** as summary page |
| 9 | Materials — product quantities | **Rebrand** as materials page |
| 10 | Vents — ventilation recommendations | **Rebrand** as vents page |
| 11 | Past Views — historical imagery | **Drop** |
| 12 | Ads — GAF marketing | **Drop** |

**Data sources:**
- `measurements.gafAssets` — Blob URLs for diagram images (Top View, Side Views, Cover)
- `measurements.rawResponse` — Full GAF callback payload with `RoofMeasurement` object containing:
  - `Area`, `Facets`, `Pitch` (predominant)
  - Per-facet areas and pitches
  - Ridge/Hip/Valley/Rake/Eave lengths
  - Material quantities (TimberlineBundles, StormGuardRolls, StarterBundles, RidgeCapBundles, DripEdgePieces, NailBoxes, etc.)
  - Waste factor table

**Files:**
- Create: `src/lib/pdf/measurement-report-template.tsx` — `@react-pdf/renderer` branded template
- Create: `src/app/api/portal/reports/measurement/route.ts` — GET endpoint that generates branded PDF on-the-fly from measurement data
- Modify: `src/app/portal/documents/page.tsx` — Point "GAF Roof Measurement Report" download URL to branded endpoint instead of raw Blob URL
- Reference: `src/lib/pdf/receipt-template.tsx` (existing branded PDF pattern)
- Reference: `designs/brand.md` (colors, logo, fonts)

**Step 1: Build the branded PDF template**
- RR logo + colors in header/footer on every page
- Cover page: property address, date, "Prepared for [homeowner]", RR branding
- Measurement summary page: key stats in a clean branded table
- Diagram pages: embed satellite images from Blob in branded frames
- Materials page: product quantities in branded table format
- Use `@react-pdf/renderer` (already in package.json)

**Step 2: Create the API endpoint**
- Accept `measurementId` or `orderId` query param
- Clerk auth + ownership check
- Fetch measurement record + rawResponse
- Generate branded PDF via template
- Return as `application/pdf` with Content-Disposition header

**Step 3: Update documents page**
- Swap the GAF Report document URL from raw Blob to `/api/portal/reports/measurement?orderId={orderId}`
- Keep raw GAF PDFs in Blob for internal/ops reference

**Step 4: Commit**

```bash
git add src/lib/pdf/measurement-report-template.tsx src/app/api/portal/reports/measurement/route.ts src/app/portal/documents/page.tsx
git commit -m "feat: branded Results Roofing measurement report replacing raw GAF PDFs"
```

---

## Execution Order

```
Batch 1 (parallel): Tasks 1, 2, 3, 4     ← P0 fixes            ✅ DONE
Batch 2 (parallel): Tasks 5, 6, 7, 8     ← quick P1 wins        ✅ DONE
Batch 3 (sequential): Task 10, then 9    ← GAF + documents       ✅ DONE
Batch 4: Task 11                          ← gallery hidden        ✅ DONE
Batch 5: Task 12                          ← branded reports       ⬜ NEXT
```

**Total: 12 tasks. V2 quote wizard is PARKED.**
