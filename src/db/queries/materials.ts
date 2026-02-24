/**
 * Material order database queries
 */

import { db, schema, eq, desc } from '@/db';
import type { NewMaterialOrder } from '@/db/schema/materials';

/**
 * List all material orders, newest first
 */
export async function listMaterialOrders() {
  return db.query.materialOrders.findMany({
    orderBy: [desc(schema.materialOrders.createdAt)],
  });
}

/**
 * Get a single material order by ID
 */
export async function getMaterialOrder(id: string) {
  const order = await db.query.materialOrders.findFirst({
    where: eq(schema.materialOrders.id, id),
  });
  return order ?? null;
}

/**
 * Create a new material order
 */
export async function createMaterialOrder(data: NewMaterialOrder) {
  const result = await db
    .insert(schema.materialOrders)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update a material order (always bumps updatedAt)
 */
export async function updateMaterialOrder(
  id: string,
  data: Partial<NewMaterialOrder>
) {
  const result = await db
    .update(schema.materialOrders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.materialOrders.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Delete a material order (hard delete)
 */
export async function deleteMaterialOrder(id: string) {
  await db
    .delete(schema.materialOrders)
    .where(eq(schema.materialOrders.id, id));
}
