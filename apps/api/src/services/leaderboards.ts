import { and, desc, eq, gt, sql, count } from 'drizzle-orm'
import { type GameId } from '@maf/shared/games/ids'
import { decodeRankScore } from '@maf/shared/games/rank'
import { periodKeys } from '@maf/shared/games/daily'
import { db } from '../db/client'
import { personalBests, scores } from '../db/schema/index'
import { redis, redisReady, safeRedis } from '../redis'
import { logger } from '../logger'
import { loadPlayerSummaries, type PlayerSummary } from './playerCache'

export type Period = 'daily' | 'weekly' | 'alltime'

export interface LeaderboardEntry extends PlayerSummary {
  rank: number
  value: number
  secondary: number | null
  rankScore: number
}

const zkey = (gameId: GameId, periodKey: string) => `lb:v1:${gameId}:${periodKey}`
const ttlFor = (periodKey: string) =>
  periodKey.startsWith('d:') ? 3 * 86_400 : periodKey.startsWith('w:') ? 21 * 86_400 : null

export function periodKeyFor(period: Period, now = new Date()): string {
  return periodKeys(now)[period]
}

/** Record a (possibly improved) best into the ZSETs. `ZADD GT` keeps the higher rank score only. */
export async function pushToZsets(
  gameId: GameId,
  userId: string,
  rankScore: number,
  keys: string[],
) {
  await safeRedis(async (r) => {
    const pipe = r.pipeline()
    for (const k of keys) {
      const zk = zkey(gameId, k)
      pipe.zadd(zk, 'GT', rankScore, userId)
      const ttl = ttlFor(k)
      if (ttl) pipe.expire(zk, ttl, 'NX')
    }
    await pipe.exec()
  }, null)
}

async function rebuildZset(gameId: GameId, periodKey: string) {
  const rows = await db
    .select({ userId: personalBests.userId, rankScore: personalBests.rankScore })
    .from(personalBests)
    .where(and(eq(personalBests.gameId, gameId), eq(personalBests.periodKey, periodKey)))
  if (rows.length === 0) return false
  await safeRedis(async (r) => {
    const zk = zkey(gameId, periodKey)
    const pipe = r.pipeline()
    for (const row of rows) pipe.zadd(zk, 'GT', row.rankScore, row.userId)
    const ttl = ttlFor(periodKey)
    if (ttl) pipe.expire(zk, ttl, 'NX')
    await pipe.exec()
  }, null)
  logger.info({ gameId, periodKey, n: rows.length }, 'leaderboard zset rebuilt')
  return true
}

async function ensureZset(gameId: GameId, periodKey: string): Promise<boolean> {
  if (!redisReady()) return false
  const exists = await safeRedis((r) => r.exists(zkey(gameId, periodKey)), -1)
  if (exists === -1) return false
  if (exists === 1) return true
  return rebuildZset(gameId, periodKey)
}

async function topFromRedis(gameId: GameId, periodKey: string, limit: number) {
  const raw = await safeRedis(
    (r) => r.zrevrange(zkey(gameId, periodKey), 0, limit - 1, 'WITHSCORES'),
    null,
  )
  if (!raw) return null
  const out: { userId: string; rankScore: number }[] = []
  for (let i = 0; i < raw.length; i += 2)
    out.push({ userId: raw[i], rankScore: Number(raw[i + 1]) })
  return out
}

async function topFromPg(gameId: GameId, periodKey: string, limit: number) {
  return db
    .select({ userId: personalBests.userId, rankScore: personalBests.rankScore })
    .from(personalBests)
    .where(and(eq(personalBests.gameId, gameId), eq(personalBests.periodKey, periodKey)))
    .orderBy(desc(personalBests.rankScore))
    .limit(limit)
}

export async function rankOf(
  gameId: GameId,
  periodKey: string,
  userId: string,
): Promise<{ rank: number; rankScore: number } | null> {
  if (await ensureZset(gameId, periodKey)) {
    const res = await safeRedis(
      async (r) => {
        const [rank, score] = await Promise.all([
          r.zrevrank(zkey(gameId, periodKey), userId),
          r.zscore(zkey(gameId, periodKey), userId),
        ])
        return rank == null || score == null ? null : { rank: rank + 1, rankScore: Number(score) }
      },
      undefined as { rank: number; rankScore: number } | null | undefined,
    )
    if (res !== undefined) return res
  }
  const mine = await db
    .select({ rankScore: personalBests.rankScore })
    .from(personalBests)
    .where(
      and(
        eq(personalBests.gameId, gameId),
        eq(personalBests.periodKey, periodKey),
        eq(personalBests.userId, userId),
      ),
    )
    .limit(1)
  if (!mine[0]) return null
  const [{ n }] = await db
    .select({ n: count() })
    .from(personalBests)
    .where(
      and(
        eq(personalBests.gameId, gameId),
        eq(personalBests.periodKey, periodKey),
        gt(personalBests.rankScore, mine[0].rankScore),
      ),
    )
  return { rank: Number(n) + 1, rankScore: mine[0].rankScore }
}

export async function getLeaderboard(
  gameId: GameId,
  period: Period,
  limit = 50,
  meUserId?: string | null,
) {
  const periodKey = periodKeyFor(period)
  let rows: { userId: string; rankScore: number }[] | null = null
  let source: 'redis' | 'pg' = 'pg'
  if (await ensureZset(gameId, periodKey)) {
    rows = await topFromRedis(gameId, periodKey, limit)
    if (rows) source = 'redis'
  }
  if (!rows) rows = await topFromPg(gameId, periodKey, limit)

  const ids = rows.map((r) => r.userId)
  const me = meUserId ? await rankOf(gameId, periodKey, meUserId) : null
  if (me && !ids.includes(meUserId!)) ids.push(meUserId!)
  const players = await loadPlayerSummaries(ids)

  const hydrate = (userId: string, rankScore: number, rank: number): LeaderboardEntry => {
    const p = players.get(userId)
    const { value, secondary } = decodeRankScore(gameId, rankScore)
    return {
      rank,
      userId,
      nickname: p?.nickname ?? null,
      color: p?.color ?? 'red',
      avatarUrl: p?.avatarUrl ?? null,
      value,
      secondary: secondary === 0 ? null : secondary,
      rankScore,
    }
  }
  return {
    gameId,
    period,
    periodKey,
    source,
    entries: rows.map((r, i) => hydrate(r.userId, r.rankScore, i + 1)),
    me: me && meUserId ? hydrate(meUserId, me.rankScore, me.rank) : null,
  }
}

/** Number-one holder per game for the hub crowns. */
export async function leaderboardSummary(period: Period = 'alltime') {
  const { GAME_IDS } = await import('@maf/shared/games/ids')
  const out: Record<string, LeaderboardEntry | null> = {}
  for (const g of GAME_IDS) {
    const board = await getLeaderboard(g, period, 1)
    out[g] = board.entries[0] ?? null
  }
  return out
}

/** Full rebuild of every ZSET from Postgres (ops script / after Redis flush). */
export async function rebuildAllLeaderboards() {
  const rows = await db
    .selectDistinct({ gameId: personalBests.gameId, periodKey: personalBests.periodKey })
    .from(personalBests)
  for (const { gameId, periodKey } of rows) await rebuildZset(gameId, periodKey)
  return rows.length
}

export const scoresTable = scores
export const _sql = sql
export const _redis = redis
