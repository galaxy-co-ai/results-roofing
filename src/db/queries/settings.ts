/**
 * Settings database queries (company, pipeline stages, notification preferences)
 */

import { db, schema, eq, asc } from '@/db';
import type { NewCompanySettings, NewPipelineStage } from '@/db/schema/settings';

// ---------------------------------------------------------------------------
// Company Settings (single-row)
// ---------------------------------------------------------------------------

/**
 * Get company settings (first row or null)
 */
export async function getCompanySettings() {
  const rows = await db.query.companySettings.findMany({ limit: 1 });
  return rows[0] ?? null;
}

/**
 * Upsert company settings — update existing or insert new
 */
export async function upsertCompanySettings(data: NewCompanySettings) {
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
    .values(data)
    .returning();
  return result[0];
}

// ---------------------------------------------------------------------------
// Pipeline Stages
// ---------------------------------------------------------------------------

/**
 * List pipeline stages ordered by position (ascending)
 */
export async function listPipelineStages() {
  return db.query.pipelineStages.findMany({
    orderBy: [asc(schema.pipelineStages.position)],
  });
}

/**
 * Create a new pipeline stage
 */
export async function createPipelineStage(data: NewPipelineStage) {
  const result = await db
    .insert(schema.pipelineStages)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update a pipeline stage (always bumps updatedAt)
 */
export async function updatePipelineStage(
  id: string,
  data: Partial<NewPipelineStage>
) {
  const result = await db
    .update(schema.pipelineStages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.pipelineStages.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Delete a pipeline stage (hard delete)
 */
export async function deletePipelineStage(id: string) {
  await db
    .delete(schema.pipelineStages)
    .where(eq(schema.pipelineStages.id, id));
}

/**
 * Reorder pipeline stages — bulk update positions
 */
export async function reorderPipelineStages(
  stages: { id: string; position: number }[]
) {
  for (const stage of stages) {
    await db
      .update(schema.pipelineStages)
      .set({ position: stage.position, updatedAt: new Date() })
      .where(eq(schema.pipelineStages.id, stage.id));
  }
}

// ---------------------------------------------------------------------------
// Notification Preferences
// ---------------------------------------------------------------------------

/**
 * List all notification preferences
 */
export async function listNotificationPreferences() {
  return db.query.notificationPreferences.findMany();
}

/**
 * Update a notification preference by event type
 */
export async function updateNotificationPreference(
  eventType: string,
  data: { emailEnabled?: boolean; smsEnabled?: boolean }
) {
  const result = await db
    .update(schema.notificationPreferences)
    .set({ ...data, updatedAt: new Date() })
    .where(
      eq(
        schema.notificationPreferences.eventType,
        eventType as typeof schema.notificationPreferences.eventType.enumValues[number]
      )
    )
    .returning();
  return result[0] ?? null;
}
