CREATE TABLE "account_deletion_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempt_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
