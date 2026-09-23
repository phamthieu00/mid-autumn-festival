import { sql } from 'drizzle-orm'
import { jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const lanternColorEnum = pgEnum('lantern_color', ['red', 'gold', 'orange', 'pink'])

export const players = pgTable(
  'players',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    nickname: text('nickname'),
    color: lanternColorEnum('color').notNull().default('red'),
    locale: text('locale').notNull().default('vi'),
    avatarUrl: text('avatar_url'),
    legacyBests:
      jsonb('legacy_bests').$type<Record<string, { value: number; secondary?: number }>>(),
    bannedAt: timestamp('banned_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('players_nickname_lower_idx').on(sql`lower(${t.nickname})`)],
)

export type Player = typeof players.$inferSelect
