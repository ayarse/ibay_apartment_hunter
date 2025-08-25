CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"ibay_id" integer,
	"title" varchar(255),
	"url" varchar(255),
	"price" varchar(255),
	"location" varchar(255),
	"raw_data" text,
	"created_at" timestamp DEFAULT now()
);
