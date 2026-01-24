import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';

// Memory categories for organization
export const memoryCategory = pgEnum('memory_category', [
  'decision',      // Architectural/technical decisions made
  'preference',    // User preferences (coding style, tools, etc.)
  'context',       // Project context (goals, constraints)
  'blocker',       // Known blockers or issues
  'insight',       // Key insights from discussions
  'todo',          // Action items or reminders
]);

export const aiMemories = pgTable('ai_memories', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),           // The condensed insight/fact
  category: memoryCategory('category').notNull().default('insight'),
  source: text('source').default('chat'),       // Where this came from: 'chat', 'manual', 'extracted'
  importance: text('importance').default('normal'), // 'low', 'normal', 'high', 'critical'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),           // Optional expiry for time-sensitive info
}, (table) => ({
  categoryIdx: index('ai_memories_category_idx').on(table.category),
  importanceIdx: index('ai_memories_importance_idx').on(table.importance),
  createdAtIdx: index('ai_memories_created_at_idx').on(table.createdAt),
}));

export type AIMemory = typeof aiMemories.$inferSelect;
export type NewAIMemory = typeof aiMemories.$inferInsert;
