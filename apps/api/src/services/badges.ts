import { and, countDistinct, count, desc, eq } from 'drizzle-orm'
import { dailyStreak, evaluateBadges, type BadgeContext } from '@maf/shared/badges'
import { dailyKey as vnDailyKey } from '@maf/shared/games/daily'
import { db } from '../db/client'
import { playerBadges, scores } from '../db/schema/index'

export async function playerStats(userId: string): Promise<BadgeContext['stats']> {
  const [totals] = await db
    .select({ total: count(), distinct: countDistinct(scores.gameId) })
    .from(scores)
    .where(eq(scores.userId, userId))
  const dailyRows = await db
    .selectDistinct({ key: scores.dailyKey })
    .from(scores)
    .where(and(eq(scores.userId, userId), eq(scores.mode, 'daily')))
    .orderBy(desc(scores.dailyKey))
    .limit(60)
  const keys = dailyRows.map((r) => r.key).filter((k): k is string => !!k)
  return {
    totalGames: Number(totals?.total ?? 0),
    distinctGames: Number(totals?.distinct ?? 0),
    dailyStreak: dailyStreak(keys, vnDailyKey()),
    wishes: 0,
  }
}

/** Evaluate rules for this event and persist newly earned badges. Returns only the new ids. */
export async function awardBadges(
  userId: string,
  ctx: Omit<BadgeContext, 'stats'> & { stats?: Partial<BadgeContext['stats']> },
) {
  const stats = { ...(await playerStats(userId)), ...(ctx.stats ?? {}) }
  const earned = evaluateBadges({ ...ctx, stats })
  if (earned.length === 0) return []
  const inserted = await db
    .insert(playerBadges)
    .values(earned.map((badgeId) => ({ userId, badgeId })))
    .onConflictDoNothing()
    .returning({ badgeId: playerBadges.badgeId })
  return inserted.map((r) => r.badgeId)
}

export async function listBadges(userId: string) {
  return db
    .select({ badgeId: playerBadges.badgeId, earnedAt: playerBadges.earnedAt })
    .from(playerBadges)
    .where(eq(playerBadges.userId, userId))
    .orderBy(desc(playerBadges.earnedAt))
}
