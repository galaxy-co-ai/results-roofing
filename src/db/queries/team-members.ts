/**
 * Team member database queries
 */

import { db, schema, eq, desc } from '@/db';
import type { NewTeamMember } from '@/db/schema/team-members';

/**
 * List all team members, newest first
 */
export async function listTeamMembers() {
  return db.query.teamMembers.findMany({
    orderBy: [desc(schema.teamMembers.createdAt)],
  });
}

/**
 * Get a single team member by ID
 */
export async function getTeamMember(id: string) {
  const member = await db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.id, id),
  });
  return member ?? null;
}

/**
 * Create a new team member
 */
export async function createTeamMember(data: NewTeamMember) {
  const result = await db
    .insert(schema.teamMembers)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update a team member (always bumps updatedAt)
 */
export async function updateTeamMember(
  id: string,
  data: Partial<NewTeamMember>
) {
  const result = await db
    .update(schema.teamMembers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.teamMembers.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Delete a team member (hard delete)
 */
export async function deleteTeamMember(id: string) {
  await db
    .delete(schema.teamMembers)
    .where(eq(schema.teamMembers.id, id));
}
