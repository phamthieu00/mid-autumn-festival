import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { lanternColorEnum } from './players'

export const wishStatusEnum = pgEnum('wish_status', ['visible', 'pending', 'hidden'])

export const wishes = pgTable(
  'wishes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    displayName: text('display_name').notNull(),
    text: text('text').notNull(),
    color: lanternColorEnum('color').notNull(),
    lang: text('lang').notNull().default('vi'),
    status: wishStatusEnum('status').notNull().default('visible'),
    reportCount: integer('report_count').notNull().default(0),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('wishes_status_created_idx').on(t.status, t.createdAt.desc(), t.id),
    index('wishes_user_idx').on(t.userId),
  ],
)

export const wishReports = pgTable(
  'wish_reports',
  {
    wishId: uuid('wish_id')
      .notNull()
      .references(() => wishes.id, { onDelete: 'cascade' }),
    reporterKey: text('reporter_key').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.wishId, t.reporterKey] })],
)

export type WishRow = typeof wishes.$inferSelect
