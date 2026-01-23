CREATE TYPE "public"."feedback_reason" AS ENUM('bug', 'suggestion', 'general');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('new', 'reviewed', 'in_progress', 'resolved', 'wont_fix');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('feature', 'bug', 'refactor', 'design', 'docs', 'test', 'chore');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('backlog', 'todo', 'in_progress', 'review', 'done');--> statement-breakpoint
CREATE TYPE "public"."note_category" AS ENUM('architecture', 'decision', 'idea', 'reference', 'todo', 'meeting', 'general');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reason" "feedback_reason" NOT NULL,
	"sub_option" text NOT NULL,
	"custom_reason" text,
	"notes" text,
	"page" text NOT NULL,
	"user_agent" text,
	"feedback_timestamp" timestamp with time zone NOT NULL,
	"status" "feedback_status" DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'backlog' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"category" "task_category" DEFAULT 'feature' NOT NULL,
	"feedback_id" uuid,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dev_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" "note_category" DEFAULT 'general' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dev_tasks" ADD CONSTRAINT "dev_tasks_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feedback_reason_idx" ON "feedback" USING btree ("reason");--> statement-breakpoint
CREATE INDEX "feedback_created_idx" ON "feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dev_tasks_status_idx" ON "dev_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dev_tasks_priority_idx" ON "dev_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "dev_tasks_category_idx" ON "dev_tasks" USING btree ("category");--> statement-breakpoint
CREATE INDEX "dev_tasks_feedback_idx" ON "dev_tasks" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "dev_tasks_created_idx" ON "dev_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dev_notes_category_idx" ON "dev_notes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "dev_notes_pinned_idx" ON "dev_notes" USING btree ("is_pinned");--> statement-breakpoint
CREATE INDEX "dev_notes_created_idx" ON "dev_notes" USING btree ("created_at");