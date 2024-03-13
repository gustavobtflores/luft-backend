DO $$ BEGIN
 CREATE TYPE "ticker_type" AS ENUM('bdr', 'crypto', 'stock', 'reit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transaction_type" AS ENUM('buy', 'sell');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(20) NOT NULL,
	"price" numeric(19, 8) NOT NULL,
	"quantity" numeric(19, 8) NOT NULL,
	"ticker_type" "ticker_type" NOT NULL,
	"type" "transaction_type" NOT NULL,
	"date" date DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
