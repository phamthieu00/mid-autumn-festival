import { Hono } from 'hono'
import { and, eq, inArray } from 'drizzle-orm'
import { GAME_IDS } from '@maf/shared/games/ids'
import { dailyKey as vnDailyKey, nextResetAt, periodKeys } from '@maf/shared/games/daily'
import { db } from '../db/client'
import { gameSessions, scores } from '../db/schema/index'
import type { SessionVars } from '../middleware/session'
import { rankOf } from '../services/leaderboards'

export const dailyRoutes = new Hono<SessionVars>().get('/daily', async (c) => {
  const now = new Date()
  const key = vnDailyKey(now)
  const user = c.get('user')
  const mine = new Map<string, { value: number; secondary: number | null }>()
  if (user) {
    const rows = await db
      .select({ gameId: scores.gameId, value: scores.value, secondary: scores.secondary })
      .from(scores)
      .innerJoin(gameSessions, eq(gameSessions.id, scores.sessionId))
      .where(
        and(
          eq(scores.userId, user.id),
          eq(scores.mode, 'daily'),
          eq(scores.dailyKey, key),
          inArray(scores.gameId, [...GAME_IDS]),
        ),
      )
    for (const r of rows) mine.set(r.gameId, { value: r.value, secondary: r.secondary })
  }
  const dailyPeriod = periodKeys(now).daily
  const challenges = await Promise.all(
    GAME_IDS.map(async (gameId) => {
      const my = mine.get(gameId) ?? null
      const rank = my && user ? await rankOf(gameId, dailyPeriod, user.id) : null
      return {
        gameId,
        done: !!my,
        myValue: my?.value ?? null,
        mySecondary: my?.secondary ?? null,
        myRank: rank?.rank ?? null,
      }
    }),
  )
  return c.json({ dailyKey: key, resetsAt: nextResetAt(now).toISOString(), challenges })
})
