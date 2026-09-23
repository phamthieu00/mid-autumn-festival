import { sql } from 'drizzle-orm'
import {
  bigint,
  bigserial,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { GAME_IDS } from '@maf/shared/games/ids'
import { user } from './auth'

export const gameIdEnum = pgEnum('game_id', GAME_IDS)
export const sessionModeEnum = pgEnum('session_mode', ['free', 'daily'])
export const sessionStatusEnum = pgEnum('session_status', [
  'started',
  'finished',
  'expired',
  'rejected',
])

export interface QuizSessionPayload {
  questionIds: string[]
  answers: (number | null)[]
}

export const gameSessions = pgTable(
  'game_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    gameId: gameIdEnum('game_id').notNull(),
    mode: sessionModeEnum('mode').notNull().default('free'),
    dailyKey: date('daily_key', { mode: 'string' }),
    seed: integer('seed').notNull(),
    payload: jsonb('payload')
      .$type<QuizSessionPayload | Record<string, never>>()
      .notNull()
      .default({}),
    status: sessionStatusEnum('status').notNull().default('started'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    ipHash: text('ip_hash'),
    flags: text('flags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
  },
  (t) => [
    index('game_sessions_user_game_idx').on(t.userId, t.gameId),
    index('game_sessions_status_expires_idx').on(t.status, t.expiresAt),
    uniqueIndex('game_sessions_daily_once_idx')
      .on(t.userId, t.gameId, t.dailyKey)
      .where(sql`${t.mode} = 'daily' and ${t.status} = 'finished'`),
  ],
)

export const scores = pgTable(
  'scores',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    publicId: text('public_id').notNull().unique(),
    sessionId: uuid('session_id')
      .notNull()
      .unique()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    gameId: gameIdEnum('game_id').notNull(),
    mode: sessionModeEnum('mode').notNull(),
    dailyKey: date('daily_key', { mode: 'string' }),
    value: integer('value').notNull(),
    secondary: integer('secondary'),
    rankScore: doublePrecision('rank_score').notNull(),
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('scores_game_rank_idx').on(t.gameId, t.rankScore.desc()),
    index('scores_game_daily_rank_idx').on(t.gameId, t.dailyKey, t.rankScore.desc()),
    index('scores_user_game_idx').on(t.userId, t.gameId, t.createdAt.desc()),
  ],
)

export const personalBests = pgTable(
  'personal_bests',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gameId: gameIdEnum('game_id').notNull(),
    periodKey: text('period_key').notNull(),
    scoreId: bigint('score_id', { mode: 'number' })
      .notNull()
      .references(() => scores.id, { onDelete: 'cascade' }),
    rankScore: doublePrecision('rank_score').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.gameId, t.periodKey] }),
    index('personal_bests_board_idx').on(t.gameId, t.periodKey, t.rankScore.desc()),
  ],
)

export const dailyChallenges = pgTable(
  'daily_challenges',
  {
    dailyKey: date('daily_key', { mode: 'string' }).notNull(),
    gameId: gameIdEnum('game_id').notNull(),
    seed: integer('seed').notNull(),
    payload: jsonb('payload').$type<{ questionIds?: string[] }>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.dailyKey, t.gameId] })],
)

export type GameSession = typeof gameSessions.$inferSelect
export type Score = typeof scores.$inferSelect
