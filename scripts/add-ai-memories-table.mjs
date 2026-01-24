/**
 * Add AI Memories table for persistent context storage
 * Run with: node scripts/add-ai-memories-table.mjs
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createAIMemoriesTable() {
  console.log('Creating AI Memories table...\n');

  try {
    // Create the enum type
    await sql`
      DO $$ BEGIN
        CREATE TYPE memory_category AS ENUM (
          'decision',
          'preference', 
          'context',
          'blocker',
          'insight',
          'todo'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✓ Created memory_category enum');

    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_memories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        category memory_category NOT NULL DEFAULT 'insight',
        source TEXT DEFAULT 'chat',
        importance TEXT DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMP
      )
    `;
    console.log('✓ Created ai_memories table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS ai_memories_category_idx ON ai_memories(category)`;
    await sql`CREATE INDEX IF NOT EXISTS ai_memories_importance_idx ON ai_memories(importance)`;
    await sql`CREATE INDEX IF NOT EXISTS ai_memories_created_at_idx ON ai_memories(created_at)`;
    console.log('✓ Created indexes');

    console.log('\n✅ AI Memories table created successfully!');

  } catch (error) {
    console.error('Error creating AI Memories table:', error);
    process.exit(1);
  }
}

createAIMemoriesTable();
