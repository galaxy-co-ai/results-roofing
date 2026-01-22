CREATE TYPE "public"."quote_status" AS ENUM('preliminary', 'measured', 'selected', 'financed', 'scheduled', 'signed', 'converted');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('good', 'better', 'best');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'deposit_paid', 'scheduled', 'in_progress', 'completed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('deposit', 'balance', 'refund');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"phone" text,
	"first_name" text,
	"last_name" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"jobnimbus_contact_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "out_of_area_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"zip" text,
	"state" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"status" "quote_status" DEFAULT 'preliminary' NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"replacement_motivation" text,
	"sqft_total" numeric(10, 2),
	"pitch_primary" numeric(4, 2),
	"complexity" text,
	"pricing_data" jsonb,
	"selected_tier" "tier",
	"tier_selected_at" timestamp with time zone,
	"total_price" numeric(10, 2),
	"deposit_amount" numeric(10, 2),
	"financing_status" text,
	"financing_application_id" text,
	"financing_term" text,
	"financing_monthly_payment" numeric(10, 2),
	"scheduled_slot_id" text,
	"scheduled_date" timestamp with time zone,
	"jobnimbus_job_id" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"vendor" text DEFAULT 'roofr' NOT NULL,
	"vendor_job_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sqft_total" numeric(10, 2),
	"sqft_steep" numeric(10, 2),
	"sqft_flat" numeric(10, 2),
	"pitch_primary" numeric(4, 2),
	"pitch_min" numeric(4, 2),
	"pitch_max" numeric(4, 2),
	"facet_count" integer,
	"ridge_length_ft" numeric(10, 2),
	"valley_length_ft" numeric(10, 2),
	"eave_length_ft" numeric(10, 2),
	"hip_length_ft" numeric(10, 2),
	"complexity" text,
	"raw_response" jsonb,
	"error_message" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"documenso_document_id" text,
	"template_version" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"customer_email" text NOT NULL,
	"sent_at" timestamp with time zone,
	"viewed_at" timestamp with time zone,
	"signed_at" timestamp with time zone,
	"signature_ip" text,
	"signature_user_agent" text,
	"company_signed_at" timestamp with time zone,
	"signed_pdf_url" text,
	"signed_pdf_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"confirmation_number" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"customer_name" text,
	"clerk_user_id" text,
	"property_address" text NOT NULL,
	"property_city" text NOT NULL,
	"property_state" text NOT NULL,
	"property_zip" text NOT NULL,
	"selected_tier" text NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"deposit_amount" numeric(10, 2) NOT NULL,
	"balance_due" numeric(10, 2) NOT NULL,
	"financing_used" text,
	"financing_term_months" text,
	"scheduled_start_date" timestamp with time zone,
	"estimated_completion_date" timestamp with time zone,
	"actual_completion_date" timestamp with time zone,
	"jobnimbus_job_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_confirmation_number_unique" UNIQUE("confirmation_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" "payment_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"stripe_refund_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"card_last4" text,
	"card_brand" text,
	"failure_code" text,
	"failure_message" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" text DEFAULT 'installation' NOT NULL,
	"calcom_booking_id" text,
	"calcom_event_type_id" text,
	"calcom_uid" text,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"timezone" text DEFAULT 'America/Chicago' NOT NULL,
	"attendee_name" text,
	"attendee_email" text,
	"attendee_phone" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"reschedule_count" integer DEFAULT 0 NOT NULL,
	"previous_scheduled_start" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"phone" text NOT NULL,
	"consent_given" boolean NOT NULL,
	"consent_source" text NOT NULL,
	"consent_text" text,
	"ip_address" text,
	"user_agent" text,
	"opted_out_at" timestamp with time zone,
	"opt_out_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"token" text NOT NULL,
	"shared_by_email" text,
	"shared_to_email" text,
	"shared_to_name" text,
	"message" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_shares_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"source" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone,
	"processing_error" text,
	"retry_count" text DEFAULT '0',
	"related_entity_type" text,
	"related_entity_id" uuid,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"material_price_per_sqft" numeric(10, 2) NOT NULL,
	"labor_price_per_sqft" numeric(10, 2) NOT NULL,
	"shingle_type" text NOT NULL,
	"shingle_brand" text,
	"underlayment_type" text,
	"warranty_years" text NOT NULL,
	"warranty_type" text,
	"lead_time_weeks" text,
	"is_popular" boolean DEFAULT false NOT NULL,
	"sort_order" text DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_tiers_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_consents" ADD CONSTRAINT "sms_consents_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_shares" ADD CONSTRAINT "quote_shares_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_jobnimbus_idx" ON "leads" USING btree ("jobnimbus_contact_id");--> statement-breakpoint
CREATE INDEX "leads_created_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "out_of_area_leads_email_idx" ON "out_of_area_leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "out_of_area_leads_state_idx" ON "out_of_area_leads" USING btree ("state");--> statement-breakpoint
CREATE INDEX "out_of_area_leads_created_idx" ON "out_of_area_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quotes_lead_idx" ON "quotes" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quotes_created_idx" ON "quotes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quotes_jobnimbus_idx" ON "quotes" USING btree ("jobnimbus_job_id");--> statement-breakpoint
CREATE INDEX "quotes_expires_idx" ON "quotes" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "measurements_quote_idx" ON "measurements" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "measurements_vendor_job_idx" ON "measurements" USING btree ("vendor_job_id");--> statement-breakpoint
CREATE INDEX "measurements_status_idx" ON "measurements" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "contracts_quote_idx" ON "contracts" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "contracts_documenso_idx" ON "contracts" USING btree ("documenso_document_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_quote_idx" ON "orders" USING btree ("quote_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_contract_idx" ON "orders" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "orders_confirmation_idx" ON "orders" USING btree ("confirmation_number");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_clerk_user_idx" ON "orders" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_stripe_intent_idx" ON "payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "payments_stripe_charge_idx" ON "payments" USING btree ("stripe_charge_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_order_idx" ON "appointments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "appointments_calcom_booking_idx" ON "appointments" USING btree ("calcom_booking_id");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_scheduled_idx" ON "appointments" USING btree ("scheduled_start");--> statement-breakpoint
CREATE INDEX "sms_consents_lead_idx" ON "sms_consents" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "sms_consents_phone_idx" ON "sms_consents" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "sms_consents_created_idx" ON "sms_consents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quote_shares_quote_idx" ON "quote_shares" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_shares_token_idx" ON "quote_shares" USING btree ("token");--> statement-breakpoint
CREATE INDEX "quote_shares_expires_idx" ON "quote_shares" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "webhook_events_event_id_idx" ON "webhook_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_source_idx" ON "webhook_events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events" USING btree ("processed");--> statement-breakpoint
CREATE INDEX "webhook_events_received_idx" ON "webhook_events" USING btree ("received_at");