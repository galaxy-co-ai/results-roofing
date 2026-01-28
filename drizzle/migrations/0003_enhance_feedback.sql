-- Migration: Enhance feedback table with priority, element targeting, and user context
-- Created: 2026-01-28

-- Add priority enum
DO $$ BEGIN
  CREATE TYPE feedback_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to feedback table
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS priority feedback_priority DEFAULT 'medium' NOT NULL,
ADD COLUMN IF NOT EXISTS target_element TEXT,
ADD COLUMN IF NOT EXISTS target_element_info JSONB,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS quote_id UUID,
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS user_context JSONB,
ADD COLUMN IF NOT EXISTS task_id UUID;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS feedback_priority_idx ON feedback(priority);
CREATE INDEX IF NOT EXISTS feedback_session_idx ON feedback(session_id);
CREATE INDEX IF NOT EXISTS feedback_quote_idx ON feedback(quote_id);
