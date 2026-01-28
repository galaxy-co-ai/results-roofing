-- Migration: Add quote_drafts table for save/resume functionality
-- Created: 2026-01-28

CREATE TABLE IF NOT EXISTS "quote_drafts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "quote_id" uuid NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "resume_token" text NOT NULL UNIQUE,
  "draft_state" jsonb NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS "quote_drafts_quote_idx" ON "quote_drafts" ("quote_id");
CREATE INDEX IF NOT EXISTS "quote_drafts_email_idx" ON "quote_drafts" ("email");
CREATE INDEX IF NOT EXISTS "quote_drafts_token_idx" ON "quote_drafts" ("resume_token");
CREATE INDEX IF NOT EXISTS "quote_drafts_expires_idx" ON "quote_drafts" ("expires_at");
