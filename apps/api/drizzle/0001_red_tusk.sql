CREATE TYPE "public"."game_id" AS ENUM('catch', 'match', 'quiz', 'runner', 'rhythm', 'puzzle', 'word');--> statement-breakpoint
CREATE TYPE "public"."session_mode" AS ENUM('free', 'daily');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('started', 'finished', 'expired', 'rejected');--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"daily_key" date NOT NULL,
	"game_id" "game_id" NOT NULL,
	"seed" integer NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_challenges_daily_key_game_id_pk" PRIMARY KEY("daily_key","game_id")
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"game_id" "game_id" NOT NULL,
	"mode" "session_mode" DEFAULT 'free' NOT NULL,
	"daily_key" date,
	"seed" integer NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "session_status" DEFAULT 'started' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"ip_hash" text,
	"flags" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_bests" (
	"user_id" text NOT NULL,
	"game_id" "game_id" NOT NULL,
	"period_key" text NOT NULL,
	"score_id" bigint NOT NULL,
	"rank_score" double precision NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personal_bests_user_id_game_id_period_key_pk" PRIMARY KEY("user_id","game_id","period_key")
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text,
	"game_id" "game_id" NOT NULL,
	"mode" "session_mode" NOT NULL,
	"daily_key" date,
	"value" integer NOT NULL,
	"secondary" integer,
	"rank_score" double precision NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scores_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "scores_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_bests" ADD CONSTRAINT "personal_bests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_bests" ADD CONSTRAINT "personal_bests_score_id_scores_id_fk" FOREIGN KEY ("score_id") REFERENCES "public"."scores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_sessions_user_game_idx" ON "game_sessions" USING btree ("user_id","game_id");--> statement-breakpoint
CREATE INDEX "game_sessions_status_expires_idx" ON "game_sessions" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "game_sessions_daily_once_idx" ON "game_sessions" USING btree ("user_id","game_id","daily_key") WHERE "game_sessions"."mode" = 'daily' and "game_sessions"."status" = 'finished';--> statement-breakpoint
CREATE INDEX "personal_bests_board_idx" ON "personal_bests" USING btree ("game_id","period_key","rank_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "scores_game_rank_idx" ON "scores" USING btree ("game_id","rank_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "scores_game_daily_rank_idx" ON "scores" USING btree ("game_id","daily_key","rank_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "scores_user_game_idx" ON "scores" USING btree ("user_id","game_id","created_at" DESC NULLS LAST);