/**
 * Automation database queries
 */

import { db, schema, eq, desc } from '@/db';
import type { NewAutomation } from '@/db/schema/automations';

/**
 * List all automations, newest first
 */
export async function listAutomations() {
  return db.query.automations.findMany({
    orderBy: [desc(schema.automations.createdAt)],
  });
}

/**
 * Get a single automation by ID
 */
export async function getAutomation(id: string) {
  const automation = await db.query.automations.findFirst({
    where: eq(schema.automations.id, id),
  });
  return automation ?? null;
}

/**
 * Create a new automation
 */
export async function createAutomation(data: NewAutomation) {
  const result = await db
    .insert(schema.automations)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update an automation (always bumps updatedAt)
 */
export async function updateAutomation(
  id: string,
  data: Partial<NewAutomation>
) {
  const result = await db
    .update(schema.automations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.automations.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Delete an automation (hard delete)
 */
export async function deleteAutomation(id: string) {
  await db
    .delete(schema.automations)
    .where(eq(schema.automations.id, id));
}
