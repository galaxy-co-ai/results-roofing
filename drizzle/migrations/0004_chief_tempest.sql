CREATE TYPE "public"."feedback_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."memory_category" AS ENUM('decision', 'preference', 'context', 'blocker', 'insight', 'todo');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('draft', 'pending', 'sent', 'viewed', 'signed', 'completed', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('deposit_authorization', 'contract', 'invoice', 'receipt', 'change_order', 'warranty', 'other');--> statement-breakpoint
CREATE TABLE "quote_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"email" text NOT NULL,
	"resume_token" text NOT NULL,
	"draft_state" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_drafts_resume_token_unique" UNIQUE("resume_token")
);
--> statement-breakpoint
CREATE TABLE "ai_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"category" "memory_category" DEFAULT 'insight' NOT NULL,
	"source" text DEFAULT 'chat',
	"importance" text DEFAULT 'normal',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "document_type" NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"folder" text DEFAULT 'general' NOT NULL,
	"quote_id" uuid,
	"lead_id" uuid,
	"customer_name" text,
	"customer_email" text,
	"property_address" text,
	"docuseal_submission_id" text,
	"docuseal_slug" text,
	"docuseal_embed_src" text,
	"docuseal_document_url" text,
	"signed_at" timestamp with time zone,
	"signed_ip" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "clerk_user_id" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "clerk_user_id" text;--> statement-breakpoint
ALTER TABLE "measurements" ADD COLUMN "confidence" varchar(10) DEFAULT 'low';--> statement-breakpoint
ALTER TABLE "measurements" ADD COLUMN "imagery_quality" varchar(10);--> statement-breakpoint
ALTER TABLE "measurements" ADD COLUMN "imagery_date" varchar(10);--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "priority" "feedback_priority" DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "target_element" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "target_element_info" jsonb;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "quote_id" uuid;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "user_context" jsonb;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "dev_tasks" ADD COLUMN "phase_id" text;--> statement-breakpoint
ALTER TABLE "dev_tasks" ADD COLUMN "phase_name" text;--> statement-breakpoint
ALTER TABLE "dev_tasks" ADD COLUMN "sow_deliverable" text;--> statement-breakpoint
ALTER TABLE "quote_drafts" ADD CONSTRAINT "quote_drafts_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quote_drafts_quote_idx" ON "quote_drafts" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_drafts_email_idx" ON "quote_drafts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "quote_drafts_token_idx" ON "quote_drafts" USING btree ("resume_token");--> statement-breakpoint
CREATE INDEX "quote_drafts_expires_idx" ON "quote_drafts" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "ai_memories_category_idx" ON "ai_memories" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ai_memories_importance_idx" ON "ai_memories" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "ai_memories_created_at_idx" ON "ai_memories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "documents_quote_idx" ON "documents" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "documents_lead_idx" ON "documents" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "documents_folder_idx" ON "documents" USING btree ("folder");--> statement-breakpoint
CREATE INDEX "documents_type_idx" ON "documents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "documents_docuseal_idx" ON "documents" USING btree ("docuseal_submission_id");--> statement-breakpoint
CREATE INDEX "documents_created_idx" ON "documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_clerk_user_idx" ON "leads" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "quotes_clerk_user_idx" ON "quotes" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "measurements_vendor_idx" ON "measurements" USING btree ("vendor");--> statement-breakpoint
CREATE INDEX "feedback_priority_idx" ON "feedback" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "feedback_session_idx" ON "feedback" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "feedback_quote_idx" ON "feedback" USING btree ("quote_id");