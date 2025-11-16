CREATE TABLE "profile_likes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"liker_id" varchar NOT NULL,
	"liked_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "profile_likes_liker_id_liked_user_id_unique" UNIQUE("liker_id","liked_user_id")
);
--> statement-breakpoint
ALTER TABLE "profile_likes" ADD CONSTRAINT "profile_likes_liker_id_users_id_fk" FOREIGN KEY ("liker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_likes" ADD CONSTRAINT "profile_likes_liked_user_id_users_id_fk" FOREIGN KEY ("liked_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;