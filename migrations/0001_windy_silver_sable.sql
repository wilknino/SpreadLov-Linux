ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_code_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_code_sent_at" timestamp;