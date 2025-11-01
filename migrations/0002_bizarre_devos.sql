ALTER TABLE "users" ADD COLUMN "password_reset_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_requested_at" timestamp;