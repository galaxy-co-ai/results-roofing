CREATE TYPE "public"."changelog_type" AS ENUM('milestone', 'feature', 'update', 'fix', 'blocker', 'decision', 'note');--> statement-breakpoint
CREATE TABLE "changelog_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "changelog_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"phase_id" integer,
	"phase_name" text,
	"deliverable_name" text,
	"previous_status" text,
	"new_status" text,
	"is_auto_generated" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dev_tasks" ADD COLUMN "checklist" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
CREATE INDEX "changelog_type_idx" ON "changelog_entries" USING btree ("type");--> statement-breakpoint
CREATE INDEX "changelog_phase_idx" ON "changelog_entries" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "changelog_created_idx" ON "changelog_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "changelog_pinned_idx" ON "changelog_entries" USING btree ("is_pinned");