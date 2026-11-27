CREATE TABLE "source_vlookup" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"value_id" integer NOT NULL,
	"description" varchar(100),
	"jenis_tiket" varchar(50),
	"customer_type_key" varchar(50),
	"jenis_tiket_2_val" varchar(50),
	"realm_b2b" varchar(50),
	"flag_1" varchar(50),
	"flag_2" varchar(50)
);
