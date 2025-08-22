CREATE TABLE IF NOT EXISTS "config" (
	"config_key" varchar(50) PRIMARY KEY NOT NULL,
	"config_value" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tg_id" varchar(255),
	"pref_location" varchar(50) DEFAULT 'Male',
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"is_blocked" boolean DEFAULT null,
	CONSTRAINT "subscribers_tg_id_unique" UNIQUE("tg_id")
);
