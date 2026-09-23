CREATE TYPE "public"."wish_status" AS ENUM('visible', 'pending', 'hidden');--> statement-breakpoint
CREATE TABLE "player_badges" (
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_badges_user_id_badge_id_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "wish_reports" (
	"wish_id" uuid NOT NULL,
	"reporter_key" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wish_reports_wish_id_reporter_key_pk" PRIMARY KEY("wish_id","reporter_key")
);
--> statement-breakpoint
CREATE TABLE "wishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"text" text NOT NULL,
	"color" "lantern_color" NOT NULL,
	"lang" text DEFAULT 'vi' NOT NULL,
	"status" "wish_status" DEFAULT 'visible' NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_badges" ADD CONSTRAINT "player_badges_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wish_reports" ADD CONSTRAINT "wish_reports_wish_id_wishes_id_fk" FOREIGN KEY ("wish_id") REFERENCES "public"."wishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wishes_status_created_idx" ON "wishes" USING btree ("status","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "wishes_user_idx" ON "wishes" USING btree ("user_id");