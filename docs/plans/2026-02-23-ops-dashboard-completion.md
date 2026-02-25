# Ops Dashboard Completion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all ops dashboard gaps — wire mock pages to real DB, add write operations to read-only pages, implement missing capabilities, build out Settings, and clean up dead code.

**Architecture:** Bottom-up (schema → queries → API → hooks → UI). New Drizzle tables for Materials, Automations, Team, Company Settings, Pipeline Stages, and Notification Preferences. All follow existing patterns: UUID PKs, timezone timestamps, pgEnums for statuses, centralized queries, opsFetch/opsMutate hooks.

**Tech Stack:** Next.js 14, Drizzle ORM, Neon Postgres, TanStack React Query, TypeScript

**Excluded:** Google Analytics integration (blocked on DNS transfer)

---

## Phase 1: Data Foundation — New DB Tables + API Routes

### Task 1: Materials Schema + Queries

**Files:**
- Create: `src/db/schema/materials.ts`
- Modify: `src/db/schema/index.ts`
- Create: `src/db/queries/materials.ts`

**Step 1: Create the schema file**

```typescript
// src/db/schema/materials.ts
import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const materialOrderStatusEnum = pgEnum('material_order_status', [
  'draft',
  'sent',
  'confirmed',
  'delivered',
  'cancelled',
]);

export const materialOrders = pgTable(
  'material_orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    job: text('job').notNull(),
    supplier: text('supplier').notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    status: materialOrderStatusEnum('status').default('draft').notNull(),
    notes: text('notes'),
    orderedAt: timestamp('ordered_at', { withTimezone: true }),
    deliveryAt: timestamp('delivery_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('material_orders_status_idx').on(table.status),
    index('material_orders_created_idx').on(table.createdAt),
  ]
);

export type MaterialOrder = typeof materialOrders.$inferSelect;
export type NewMaterialOrder = typeof materialOrders.$inferInsert;
```

**Step 2: Export from schema index**

Add to `src/db/schema/index.ts`:
```typescript
export * from './materials';
```

**Step 3: Create query file**

```typescript
// src/db/queries/materials.ts
import { db, schema, eq, desc } from '@/db';
import type { NewMaterialOrder } from '@/db/schema/materials';

export async function listMaterialOrders() {
  return db.query.materialOrders.findMany({
    orderBy: [desc(schema.materialOrders.createdAt)],
  });
}

export async function getMaterialOrder(id: string) {
  return db.query.materialOrders.findFirst({
    where: eq(schema.materialOrders.id, id),
  }) ?? null;
}

export async function createMaterialOrder(data: NewMaterialOrder) {
  const result = await db.insert(schema.materialOrders).values(data).returning();
  return result[0];
}

export async function updateMaterialOrder(id: string, data: Partial<NewMaterialOrder>) {
  const result = await db
    .update(schema.materialOrders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.materialOrders.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteMaterialOrder(id: string) {
  await db.delete(schema.materialOrders).where(eq(schema.materialOrders.id, id));
}
```

**Step 4: Push schema to DB**

Run: `npm run db:push`
Expected: Tables created successfully

**Step 5: Commit**

```bash
git add src/db/schema/materials.ts src/db/schema/index.ts src/db/queries/materials.ts
git commit -m "feat(ops): add materials_orders schema + queries"
```

---

### Task 2: Automations Schema + Queries

**Files:**
- Create: `src/db/schema/automations.ts`
- Modify: `src/db/schema/index.ts`
- Create: `src/db/queries/automations.ts`

**Step 1: Create schema**

```typescript
// src/db/schema/automations.ts
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const automationStatusEnum = pgEnum('automation_status', [
  'active',
  'paused',
]);

export const automations = pgTable(
  'automations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    trigger: text('trigger').notNull(),
    actions: text('actions').notNull(),
    status: automationStatusEnum('status').default('active').notNull(),
    lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
    runs: integer('runs').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('automations_status_idx').on(table.status),
    index('automations_created_idx').on(table.createdAt),
  ]
);

export type Automation = typeof automations.$inferSelect;
export type NewAutomation = typeof automations.$inferInsert;
```

**Step 2: Export from schema index**

Add to `src/db/schema/index.ts`:
```typescript
export * from './automations';
```

**Step 3: Create query file**

```typescript
// src/db/queries/automations.ts
import { db, schema, eq, desc } from '@/db';
import type { NewAutomation } from '@/db/schema/automations';

export async function listAutomations() {
  return db.query.automations.findMany({
    orderBy: [desc(schema.automations.createdAt)],
  });
}

export async function getAutomation(id: string) {
  return db.query.automations.findFirst({
    where: eq(schema.automations.id, id),
  }) ?? null;
}

export async function createAutomation(data: NewAutomation) {
  const result = await db.insert(schema.automations).values(data).returning();
  return result[0];
}

export async function updateAutomation(id: string, data: Partial<NewAutomation>) {
  const result = await db
    .update(schema.automations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.automations.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteAutomation(id: string) {
  await db.delete(schema.automations).where(eq(schema.automations.id, id));
}
```

**Step 4: Commit** (DB push happens once after all schemas)

```bash
git add src/db/schema/automations.ts src/db/schema/index.ts src/db/queries/automations.ts
git commit -m "feat(ops): add automations schema + queries"
```

---

### Task 3: Team Members Schema + Queries

**Files:**
- Create: `src/db/schema/team-members.ts`
- Modify: `src/db/schema/index.ts`
- Create: `src/db/queries/team-members.ts`

**Step 1: Create schema**

```typescript
// src/db/schema/team-members.ts
import {
  pgTable,
  uuid,
  text,
  integer,
  decimal,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const teamMemberRoleEnum = pgEnum('team_member_role', [
  'admin',
  'manager',
  'member',
]);

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    role: teamMemberRoleEnum('role').default('member').notNull(),
    activeJobs: integer('active_jobs').default(0).notNull(),
    revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0').notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('team_members_email_idx').on(table.email),
    index('team_members_role_idx').on(table.role),
    index('team_members_created_idx').on(table.createdAt),
  ]
);

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
```

**Step 2: Export + query file** (same pattern as Tasks 1-2)

```typescript
// src/db/queries/team-members.ts
import { db, schema, eq, desc } from '@/db';
import type { NewTeamMember } from '@/db/schema/team-members';

export async function listTeamMembers() {
  return db.query.teamMembers.findMany({
    orderBy: [desc(schema.teamMembers.createdAt)],
  });
}

export async function getTeamMember(id: string) {
  return db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.id, id),
  }) ?? null;
}

export async function createTeamMember(data: NewTeamMember) {
  const result = await db.insert(schema.teamMembers).values(data).returning();
  return result[0];
}

export async function updateTeamMember(id: string, data: Partial<NewTeamMember>) {
  const result = await db
    .update(schema.teamMembers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.teamMembers.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteTeamMember(id: string) {
  await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id));
}
```

**Step 3: Commit**

```bash
git add src/db/schema/team-members.ts src/db/schema/index.ts src/db/queries/team-members.ts
git commit -m "feat(ops): add team_members schema + queries"
```

---

### Task 4: Settings Schemas (Company, Pipeline Stages, Notifications)

**Files:**
- Create: `src/db/schema/settings.ts`
- Modify: `src/db/schema/index.ts`
- Create: `src/db/queries/settings.ts`

**Step 1: Create schema with all 3 settings tables**

```typescript
// src/db/schema/settings.ts
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Company settings — single-row config
export const companySettings = pgTable('company_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyName: text('company_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  email: text('email'),
  licenseNumber: text('license_number'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Pipeline stages — ordered list
export const pipelineStages = pgTable(
  'pipeline_stages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    color: text('color'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('pipeline_stages_position_idx').on(table.position),
  ]
);

// Notification preferences
export const notificationEventTypeEnum = pgEnum('notification_event_type', [
  'new_lead',
  'proposal_signed',
  'payment_received',
  'invoice_overdue',
  'task_overdue',
]);

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: notificationEventTypeEnum('event_type').notNull().unique(),
  emailEnabled: boolean('email_enabled').default(false).notNull(),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type NewCompanySettings = typeof companySettings.$inferInsert;
export type PipelineStage = typeof pipelineStages.$inferSelect;
export type NewPipelineStage = typeof pipelineStages.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
```

**Step 2: Create query file**

```typescript
// src/db/queries/settings.ts
import { db, schema, eq, asc } from '@/db';
import type { NewCompanySettings, NewPipelineStage } from '@/db/schema/settings';

// Company settings (single row)
export async function getCompanySettings() {
  const rows = await db.query.companySettings.findMany({ limit: 1 });
  return rows[0] ?? null;
}

export async function upsertCompanySettings(data: Partial<NewCompanySettings>) {
  const existing = await getCompanySettings();
  if (existing) {
    const result = await db
      .update(schema.companySettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.companySettings.id, existing.id))
      .returning();
    return result[0];
  }
  const result = await db
    .insert(schema.companySettings)
    .values({ companyName: data.companyName || 'Results Roofing', ...data })
    .returning();
  return result[0];
}

// Pipeline stages
export async function listPipelineStages() {
  return db.query.pipelineStages.findMany({
    orderBy: [asc(schema.pipelineStages.position)],
  });
}

export async function createPipelineStage(data: NewPipelineStage) {
  const result = await db.insert(schema.pipelineStages).values(data).returning();
  return result[0];
}

export async function updatePipelineStage(id: string, data: Partial<NewPipelineStage>) {
  const result = await db
    .update(schema.pipelineStages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.pipelineStages.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deletePipelineStage(id: string) {
  await db.delete(schema.pipelineStages).where(eq(schema.pipelineStages.id, id));
}

export async function reorderPipelineStages(stages: { id: string; position: number }[]) {
  for (const stage of stages) {
    await db
      .update(schema.pipelineStages)
      .set({ position: stage.position, updatedAt: new Date() })
      .where(eq(schema.pipelineStages.id, stage.id));
  }
}

// Notification preferences
export async function listNotificationPreferences() {
  return db.query.notificationPreferences.findMany();
}

export async function updateNotificationPreference(
  eventType: string,
  data: { emailEnabled?: boolean; smsEnabled?: boolean }
) {
  const result = await db
    .update(schema.notificationPreferences)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.notificationPreferences.eventType, eventType as any))
    .returning();
  return result[0] ?? null;
}
```

**Step 3: Export from schema index, push to DB**

Add to `src/db/schema/index.ts`:
```typescript
export * from './settings';
```

Run: `npm run db:push`
Expected: All new tables created (material_orders, automations, team_members, company_settings, pipeline_stages, notification_preferences)

**Step 4: Seed pipeline stages**

Create a one-time seed in the settings query file or run via Drizzle Studio. The 10 default stages:
```
New Lead (0), Appointment Scheduled (1), Measurement Complete (2), Proposal Sent (3),
Proposal Signed (4), Pre-Production (5), Materials Ordered (6), In Progress (7),
Punch List (8), Complete (9)
```
All with `isDefault: true`.

Also seed notification preferences (5 rows, one per event type, all false).

**Step 5: Commit**

```bash
git add src/db/schema/settings.ts src/db/schema/index.ts src/db/queries/settings.ts
git commit -m "feat(ops): add settings schemas (company, pipeline stages, notifications)"
```

---

### Task 5: API Routes — Materials, Automations, Team

**Files:**
- Create: `src/app/api/ops/materials/route.ts`
- Create: `src/app/api/ops/materials/[id]/route.ts`
- Create: `src/app/api/ops/automations/route.ts`
- Create: `src/app/api/ops/automations/[id]/route.ts`
- Create: `src/app/api/ops/team/route.ts`
- Create: `src/app/api/ops/team/[id]/route.ts`

All follow the exact blog posts API pattern:
1. Auth check with `isOpsAuthenticated()`
2. Parse search params (GET) or body (POST/PUT)
3. Call query functions
4. Return JSON response

**Step 1: Create materials routes**

```typescript
// src/app/api/ops/materials/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listMaterialOrders, createMaterialOrder } from '@/db/queries/materials';

export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await listMaterialOrders();
  return NextResponse.json({ orders, total: orders.length });
}

export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const order = await createMaterialOrder({
      job: body.job,
      supplier: body.supplier,
      total: body.total,
      status: body.status || 'draft',
      notes: body.notes || null,
    });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
```

```typescript
// src/app/api/ops/materials/[id]/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { getMaterialOrder, updateMaterialOrder, deleteMaterialOrder } from '@/db/queries/materials';

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const order = await updateMaterialOrder(id, body);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await deleteMaterialOrder(id);
  return NextResponse.json({ success: true });
}
```

**Step 2: Create automations routes** (identical pattern, swap imports/field names)

**Step 3: Create team routes** (identical pattern, use PUT for full update on team/[id])

**Step 4: Verify all routes work**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 5: Commit**

```bash
git add src/app/api/ops/materials/ src/app/api/ops/automations/ src/app/api/ops/team/
git commit -m "feat(ops): add API routes for materials, automations, team"
```

---

### Task 6: API Routes — Settings

**Files:**
- Create: `src/app/api/ops/settings/route.ts`
- Create: `src/app/api/ops/settings/pipeline/route.ts`
- Create: `src/app/api/ops/settings/pipeline/[id]/route.ts`
- Create: `src/app/api/ops/settings/pipeline/reorder/route.ts`
- Create: `src/app/api/ops/settings/notifications/route.ts`
- Create: `src/app/api/ops/settings/export/route.ts`
- Create: `src/app/api/ops/settings/import/route.ts`

**Step 1: Company settings route**

```typescript
// src/app/api/ops/settings/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { getCompanySettings, upsertCompanySettings } from '@/db/queries/settings';

export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getCompanySettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const settings = await upsertCompanySettings(body);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
```

**Step 2: Pipeline stages CRUD + reorder routes**

**Step 3: Notifications route** (GET list, PUT to toggle a preference)

**Step 4: Export route** — Stream CSV of contacts, orders, quotes, payments from existing tables

```typescript
// src/app/api/ops/settings/export/route.ts
// GET → generates CSV from db tables, returns as downloadable file
// Headers: Content-Type: text/csv, Content-Disposition: attachment
```

**Step 5: Import route** — Parse CSV upload, validate rows, insert into leads table

**Step 6: Commit**

```bash
git add src/app/api/ops/settings/
git commit -m "feat(ops): add settings API routes (company, pipeline, notifications, data)"
```

---

## Phase 2: Types + Hooks + Wire Mock Pages

### Task 7: Add Types to ops.ts

**Files:**
- Modify: `src/types/ops.ts`

Add these type blocks following existing section comment pattern:

```typescript
// -----------------------------------------------------------------------------
// Materials
// -----------------------------------------------------------------------------
export type MaterialOrderStatus = 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';

export interface MaterialOrder {
  id: string;
  job: string;
  supplier: string;
  total: string; // decimal comes as string from Drizzle
  status: MaterialOrderStatus;
  notes?: string | null;
  orderedAt?: string | null;
  deliveryAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Automations
// -----------------------------------------------------------------------------
export type AutomationStatus = 'active' | 'paused';

export interface OpsAutomation {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  status: AutomationStatus;
  lastTriggeredAt?: string | null;
  runs: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Team
// -----------------------------------------------------------------------------
export type TeamMemberRole = 'admin' | 'manager' | 'member';

export interface OpsTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamMemberRole;
  activeJobs: number;
  revenue: string;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Settings
// -----------------------------------------------------------------------------
export interface CompanySettings {
  id: string;
  companyName: string;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  updatedAt: string;
}

export interface OpsPipelineStage {
  id: string;
  name: string;
  position: number;
  color?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: string;
  eventType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  updatedAt: string;
}
```

**Commit:**
```bash
git add src/types/ops.ts
git commit -m "feat(ops): add types for materials, automations, team, settings"
```

---

### Task 8: Add React Query Hooks

**Files:**
- Modify: `src/hooks/ops/use-ops-queries.ts`

**Step 1: Register new query keys** in `opsKeys` object:

```typescript
materials: () => [...opsKeys.all, 'materials'] as const,
automations: () => [...opsKeys.all, 'automations'] as const,
team: () => [...opsKeys.all, 'team'] as const,
settings: () => [...opsKeys.all, 'settings'] as const,
pipelineStages: () => [...opsKeys.all, 'pipeline-stages'] as const,
notifications: () => [...opsKeys.all, 'notifications'] as const,
```

**Step 2: Add query + mutation hooks** for each domain:

Materials hooks:
- `useOpsMaterials()` — GET `/api/ops/materials`
- `useCreateMaterial()` — POST `/api/ops/materials`
- `useUpdateMaterial()` — PATCH `/api/ops/materials/${id}`
- `useDeleteMaterial()` — DELETE `/api/ops/materials/${id}`

Automations hooks:
- `useOpsAutomations()` — GET `/api/ops/automations`
- `useCreateAutomation()` — POST `/api/ops/automations`
- `useUpdateAutomation()` — PATCH `/api/ops/automations/${id}`
- `useDeleteAutomation()` — DELETE `/api/ops/automations/${id}`

Team hooks:
- `useOpsTeam()` — GET `/api/ops/team`
- `useInviteTeamMember()` — POST `/api/ops/team`
- `useUpdateTeamMember()` — PUT `/api/ops/team/${id}`
- `useDeleteTeamMember()` — DELETE `/api/ops/team/${id}`

Settings hooks:
- `useCompanySettings()` — GET `/api/ops/settings`
- `useSaveCompanySettings()` — PUT `/api/ops/settings`
- `usePipelineStages()` — GET `/api/ops/settings/pipeline`
- `useCreatePipelineStage()` — POST
- `useUpdatePipelineStage()` — PUT `${id}`
- `useDeletePipelineStage()` — DELETE `${id}`
- `useReorderPipelineStages()` — PUT `/api/ops/settings/pipeline/reorder`
- `useNotificationPreferences()` — GET `/api/ops/settings/notifications`
- `useUpdateNotificationPreference()` — PUT `/api/ops/settings/notifications`

All follow the exact pattern from existing hooks (opsFetch, opsMutate, queryClient.invalidateQueries).

**Step 3: Commit**

```bash
git add src/hooks/ops/use-ops-queries.ts
git commit -m "feat(ops): add React Query hooks for materials, automations, team, settings"
```

---

### Task 9: Wire Materials Page to Real Data

**Files:**
- Modify: `src/app/ops/materials/page.tsx`

**Step 1: Replace imports**

Remove `useState` for orders array. Add:
```typescript
import {
  useOpsMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '@/hooks/ops/use-ops-queries';
```

**Step 2: Replace state with hooks**

Replace line 43 (`const [orders, setOrders] = useState(...)`) with:
```typescript
const { data: orders, isLoading, refetch } = useOpsMaterials();
const createMaterial = useCreateMaterial();
const updateMaterial = useUpdateMaterial();
const deleteMaterial = useDeleteMaterial();
```

**Step 3: Replace handlers**

- `handleCreate`: Call `createMaterial.mutateAsync({ job, supplier, total })` instead of `setOrders`
- `handleSendOrder`: Call `updateMaterial.mutateAsync({ id, status: 'sent', orderedAt: new Date().toISOString() })`
- `handleDelete`: Call `deleteMaterial.mutateAsync(id)`

**Step 4: Add loading states** (Skeleton pattern from existing pages)

**Step 5: Verify and commit**

Run: `npm run build`

```bash
git add src/app/ops/materials/page.tsx
git commit -m "feat(ops): wire materials page to real DB"
```

---

### Task 10: Wire Automations Page to Real Data

**Files:**
- Modify: `src/app/ops/automations/page.tsx`

Same pattern as Task 9:
- Replace `useState` with `useOpsAutomations()` + mutation hooks
- `handleCreate` → `createAutomation.mutateAsync()`
- `handleToggle` → `updateAutomation.mutateAsync({ id, status: newStatus })`
- `handleDelete` → `deleteAutomation.mutateAsync(id)`
- Add loading states

**Commit:**
```bash
git add src/app/ops/automations/page.tsx
git commit -m "feat(ops): wire automations page to real DB"
```

---

### Task 11: Wire Team Page to Real Data

**Files:**
- Modify: `src/app/ops/team/page.tsx`

Same pattern:
- Replace `useState` with `useOpsTeam()` + mutation hooks
- `handleInvite` → `useInviteTeamMember().mutateAsync()`
- `handleEdit` → `useUpdateTeamMember().mutateAsync()`
- `handleDelete` → `useDeleteTeamMember().mutateAsync()`
- Add loading states

**Commit:**
```bash
git add src/app/ops/team/page.tsx
git commit -m "feat(ops): wire team page to real DB"
```

---

### ** Checkpoint: Build + Deploy Verification**

Run: `npm run build`
Expected: Clean build, no type errors

This is a good point to push and verify Vercel deployment before continuing.

```bash
git push origin main
```

---

## Phase 3: Write Operations for Read-Only Pages

### Task 12: Estimates — Status Updates + Delete

**Files:**
- Modify: `src/app/ops/estimates/page.tsx`
- Modify: `src/hooks/ops/use-ops-queries.ts` (add `useDeleteEstimate` if missing)
- Modify: `src/app/api/ops/estimates/route.ts` (add PATCH/DELETE if missing)

**What to add:**
- Status update dropdown on each estimate row (archive, reactivate)
- Delete button with confirmation
- Wire to `useUpdateEstimateStatus()` (already exists) and new `useDeleteEstimate()`

**Commit:**
```bash
git commit -m "feat(ops): add status updates + delete to estimates page"
```

---

### Task 13: Invoices — Status Updates

**Files:**
- Modify: `src/app/ops/invoices/page.tsx`
- Modify: `src/hooks/ops/use-ops-queries.ts` (verify `useUpdateInvoiceStatus` exists)

**What to add:**
- Status actions: Mark Paid, Void, Mark Overdue
- Wire to mutation hooks
- No manual creation needed (invoices come from orders)

**Commit:**
```bash
git commit -m "feat(ops): add status actions to invoices page"
```

---

### Task 14: Calendar — Create/Edit/Cancel Appointments

**Files:**
- Modify: `src/app/ops/calendar/page.tsx`
- Create: `src/app/api/ops/calendar/route.ts` (add POST)
- Create: `src/app/api/ops/calendar/[id]/route.ts` (PATCH, DELETE)
- Modify: `src/hooks/ops/use-ops-queries.ts` (add mutation hooks)

**What to add:**
- "New Appointment" button in header (next to Refresh)
- Creation dialog: type select, date/time picker, attendee name/email, address, notes
- Edit: click existing event → edit dialog (reschedule, update notes)
- Cancel: with reason field

**Commit:**
```bash
git commit -m "feat(ops): add create/edit/cancel to calendar page"
```

---

### Task 15: Documents — Upload + Manage

**Files:**
- Modify: `src/app/ops/documents/page.tsx`
- Modify: `src/app/api/ops/documents/route.ts` (add POST for upload record)
- Create: `src/app/api/ops/documents/[id]/route.ts` (PATCH rename, DELETE)
- Modify: `src/hooks/ops/use-ops-queries.ts` (add mutation hooks)

**What to add:**
- "Upload" button → file upload dialog (stores record in DB; actual file to existing storage)
- Rename document (inline edit or dialog)
- Delete document
- Move between folders (dropdown or drag)

**Commit:**
```bash
git commit -m "feat(ops): add upload/rename/delete to documents page"
```

---

### Task 16: Payments — Status Actions

**Files:**
- Modify: `src/app/ops/payments/page.tsx`
- Modify: `src/hooks/ops/use-ops-queries.ts` (add mutation hook if needed)

**What to add:**
- "Mark Reconciled" action on payment rows
- No manual creation (payments come from Stripe)

**Commit:**
```bash
git commit -m "feat(ops): add reconciliation status to payments page"
```

---

## Phase 4: Missing Capabilities

### Task 17: New Conversation Initiation (Inbox, SMS, Email)

**Files:**
- Modify: `src/app/ops/inbox/page.tsx`
- Modify: `src/app/ops/messaging/sms/page.tsx`
- Modify: `src/app/ops/messaging/email/page.tsx`
- Modify: `src/hooks/ops/use-ops-queries.ts` (add `useCreateConversation`)
- Modify: `src/app/api/ops/conversations/route.ts` (verify POST creates new convos via GHL)

**What to add:**
- "New Message" button in each page header
- Contact picker dialog (search existing contacts)
- Compose message form (body, and subject for email)
- POST to GHL API to create conversation + send first message
- After creation, select the new conversation in the list

**Commit:**
```bash
git commit -m "feat(ops): add new conversation initiation to messaging pages"
```

---

### Task 18: Create Ticket (Support)

**Files:**
- Modify: `src/app/ops/support/page.tsx`

**What to add:**
- Wire the existing "New Ticket" button (line 120-126) with an onClick handler
- Create ticket dialog: subject, priority select, channel select, contact info (name, email, phone), initial message body
- POST to `/api/ops/support/tickets` (endpoint already exists and supports creation)
- After creation, select the new ticket in the inbox

**Commit:**
```bash
git commit -m "feat(ops): wire create ticket button in support page"
```

---

### Task 19: CRM Contacts — Wire Action Handlers

**Files:**
- Modify: `src/app/ops/crm/contacts/page.tsx`

**What to add at the TODO stubs (lines 94-104):**

1. `handleViewContact` (line 94): Open a detail dialog showing full contact info (name, email, phone, address, source, tags, dates). Read-only view using existing contact data.

2. `handleEditContact` (line 98): Open an edit dialog pre-filled with contact data. On save, call PUT `/api/ops/contacts/[id]` (route exists, requires GHL). Show toast on success.

3. `handleMessageContact` (line 102): Navigate to `/ops/inbox` with the contact pre-selected, or open a quick-compose dialog. Use `router.push('/ops/inbox?contact=' + contact.id)`.

**Commit:**
```bash
git commit -m "feat(ops): wire view/edit/message handlers in CRM contacts"
```

---

### Task 20: Dashboard — Real Activity Chart

**Files:**
- Modify: `src/app/ops/page.tsx`
- Modify: `src/app/api/ops/dashboard/stats/route.ts` (extend response)

**What to change:**
- Remove hardcoded `activityData` array (lines 33-40)
- Extend the dashboard stats API to return monthly lead + job counts (query `leads` and `orders` tables, group by month)
- Wire to `useOpsDashboardStats()` — already called, just need to consume the new `activityData` field

**Commit:**
```bash
git commit -m "feat(ops): replace mock activity chart with real data on dashboard"
```

---

### Task 21: Reports — Real Data for Placeholder Cards

**Files:**
- Modify: `src/app/ops/reports/page.tsx`
- Modify: `src/app/api/ops/analytics/route.ts` (extend response)

**What to change:**

1. **Leads by Source** (lines 138-152): Replace placeholder with a donut/bar chart showing leads grouped by `utmSource` from the `leads` table. No Google Analytics needed — this is our own data.

2. **Revenue Trend** (lines 154-169): Replace placeholder with a line chart using existing analytics data (already have daily revenue from `useOpsAnalytics`). Can reuse the data that's already fetched.

3. **Sales Rep Leaderboard** (if exists in other tabs): Query `team_members` table by revenue (once Phase 2 tables are populated).

**Commit:**
```bash
git commit -m "feat(ops): replace report placeholders with real lead source + revenue data"
```

---

### ** Checkpoint: Build + Deploy Verification**

Run: `npm run build`
Expected: Clean build

```bash
git push origin main
```

---

## Phase 5: Settings — Full Implementation

### Task 22: Settings — Company Info Tab

**Files:**
- Modify: `src/app/ops/settings/page.tsx`

**What to change:**
- Import `useCompanySettings`, `useSaveCompanySettings` hooks
- Load existing values into form state on mount
- Wire Save button to `useSaveCompanySettings().mutateAsync()`
- Show loading state while saving

---

### Task 23: Settings — Pipeline Management Tab

**Files:**
- Modify: `src/app/ops/settings/page.tsx`

**What to change:**
- Import `usePipelineStages`, `useCreatePipelineStage`, `useUpdatePipelineStage`, `useDeletePipelineStage`, `useReorderPipelineStages`
- Replace hardcoded stages array with query data
- Wire Edit button → inline edit or dialog → `useUpdatePipelineStage`
- Wire Add Stage → dialog → `useCreatePipelineStage`
- Wire Delete → confirmation → `useDeletePipelineStage` (prevent if `isDefault`)
- Add drag-to-reorder → `useReorderPipelineStages`

---

### Task 24: Settings — Integrations Tab

**Files:**
- Modify: `src/app/ops/settings/page.tsx`

**What to change:**
- Integration status is mostly informational (env var checks)
- Replace "Coming soon" toasts with:
  - Connected services: show green status + "Connected" badge (read-only)
  - Disconnected: show setup instructions in a dialog instead of toast
- Optional: add a `/api/ops/settings/integrations` GET endpoint that checks env vars and returns status map

---

### Task 25: Settings — Notifications Tab

**Files:**
- Modify: `src/app/ops/settings/page.tsx`

**What to change:**
- Import `useNotificationPreferences`, `useUpdateNotificationPreference`
- Load preferences from DB on mount
- Wire checkbox changes to `useUpdateNotificationPreference().mutateAsync()` with optimistic updates
- Show save indicator (toast or subtle "Saved" text)

---

### Task 26: Settings — Data Export/Import

**Files:**
- Modify: `src/app/ops/settings/page.tsx`

**What to change:**
- **Export**: Wire button to `GET /api/ops/settings/export` → trigger browser download of CSV
- **Import**: Wire button to file input → parse CSV client-side → POST to `/api/ops/settings/import` → show results (imported count, errors)

**Commit all settings work:**
```bash
git commit -m "feat(ops): complete all settings tabs (company, pipeline, integrations, notifications, data)"
```

---

## Phase 6: Cleanup

### Task 27: Remove Dead Code

**Files:**
- Delete: `src/components/features/ops/analytics/AreaChart.tsx`
- Delete: `src/components/features/ops/analytics/BarChart.tsx`
- Delete: `src/components/features/ops/analytics/DonutChart.tsx`
- Delete: `src/components/features/ops/analytics/ActivityFeed.tsx`
- Delete or export: `src/lib/integrations/adapters/docuseal.ts`

**Step 1:** Verify no imports reference these files

Run grep for each filename across the codebase.

**Step 2:** Delete confirmed dead files

**Step 3:** Commit

```bash
git commit -m "chore(ops): remove dead analytics chart stubs + orphaned docuseal adapter"
```

---

### Task 28: Address ESLint Warnings from Build

**Files:** Multiple (from build output)

The build log showed these warnings:
- `calendar/page.tsx:34` — `now` object in useMemo deps
- `invoices/page.tsx:52` — `invoices` logical expression in useMemo deps
- `jobs/page.tsx:73-74` — `stages`/`opportunities` in useMemo deps
- `payments/page.tsx:56` — `payments` in useMemo deps
- `reports/page.tsx:27-28` — `summary`/`pipeline` in useMemo deps
- `ContractFloatingCard.tsx:94` — missing `order.quoteId` dep
- `AnimatedCounter.tsx:70` — missing `formatNumber` dep
- `BeforeAfterSlider.tsx:26,45` — `<img>` instead of `<Image />`

Fix each by wrapping intermediate values in their own `useMemo`, adding missing deps, or switching to `next/image`.

**Commit:**
```bash
git commit -m "fix(ops): address ESLint warnings (useMemo deps, next/image)"
```

---

### Task 29: Final Build Verification + Deploy

Run: `npm run build`
Expected: Clean build, zero errors, minimal warnings

Run: `npm run lint`
Expected: No errors

```bash
git push origin main
```

Verify Vercel deployment succeeds.

---

## Execution Order & Dependencies

```
Phase 1 (Tasks 1-6): All independent of each other, can run in parallel
  └── Task 4 depends on Tasks 1-3 being committed (shared schema index)
  └── Task 5-6 depend on Tasks 1-4 (need query functions)

Phase 2 (Tasks 7-11): Sequential — types first, then hooks, then pages
  └── Task 7 (types) → Task 8 (hooks) → Tasks 9-11 (pages, can be parallel)

Phase 3 (Tasks 12-16): Independent of each other, can be parallel
  └── All depend on Phase 2 being complete

Phase 4 (Tasks 17-21): Mostly independent, can be parallel
  └── Task 21 depends on Phase 2 (needs team_members table)

Phase 5 (Tasks 22-26): Independent tabs, can be parallel
  └── All depend on Task 6 (settings API routes)

Phase 6 (Tasks 27-29): Sequential — cleanup, then lint, then deploy
```

## Estimated Scope

- **29 tasks** across 6 phases
- **~15 new files** (schemas, queries, API routes)
- **~15 modified files** (pages, hooks, types)
- **~5 deleted files** (dead code cleanup)
