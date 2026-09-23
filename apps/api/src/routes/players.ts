import { Hono } from 'hono'
import { and, count, eq } from 'drizzle-orm'
import { GAME_IDS } from '@maf/shared/games/ids'
import { db } from '../db/client'
import { personalBests, players, scores } from '../db/schema/index'
import { ApiError } from '../middleware/error'
import type { SessionVars } from '../middleware/session'
import { listBadges } from '../services/badges'
import { rankOf } from '../services/leaderboards'

export async function publicProfile(userId: string) {
  const [player] = await db.select().from(players).where(eq(players.userId, userId)).limit(1)
  if (!player) return null
  const [totals] = await db.select({ total: count() }).from(scores).where(eq(scores.userId, userId))
  const bestRows = await db
    .select({
      gameId: personalBests.gameId,
      value: scores.value,
      secondary: scores.secondary,
      at: scores.createdAt,
    })
    .from(personalBests)
    .innerJoin(scores, eq(scores.id, personalBests.scoreId))
    .where(and(eq(personalBests.userId, userId), eq(personalBests.periodKey, 'alltime')))
  const bests = await Promise.all(
    GAME_IDS.map(async (gameId) => {
      const best = bestRows.find((b) => b.gameId === gameId)
      if (!best) return { gameId, value: null, secondary: null, rank: null, at: null }
      const rank = await rankOf(gameId, 'alltime', userId)
      return {
        gameId,
        value: best.value,
        secondary: best.secondary,
        rank: rank?.rank ?? null,
        at: best.at,
      }
    }),
  )
  return {
    userId,
    nickname: player.nickname,
    color: player.color,
    avatarUrl: player.avatarUrl,
    createdAt: player.createdAt,
    totalGames: Number(totals?.total ?? 0),
    bests,
    badges: await listBadges(userId),
  }
}

export const playerRoutes = new Hono<SessionVars>().get('/players/:id', async (c) => {
  const profile = await publicProfile(c.req.param('id'))
  if (!profile) throw new ApiError(404, 'PLAYER_NOT_FOUND')
  return c.json(profile)
})
