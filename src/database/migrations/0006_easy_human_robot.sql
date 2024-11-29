CREATE TABLE IF NOT EXISTS "balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL,
	"total" numeric(19, 8) NOT NULL,
	"appreciation" numeric(19, 8) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "balances" ADD CONSTRAINT "balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
