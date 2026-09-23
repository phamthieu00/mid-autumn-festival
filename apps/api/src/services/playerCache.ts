import { inArray } from 'drizzle-orm'
import { db } from '../db/client'
import { players } from '../db/schema/index'
import { safeRedis } from '../redis'

export interface PlayerSummary {
  userId: string
  nickname: string | null
  color: string
  avatarUrl: string | null
}

const key = (id: string) => `player:v1:${id}`
const TTL = 3600

/** Batch-load public player summaries, using Redis as a read-through cache. */
export async function loadPlayerSummaries(
  ids: readonly string[],
): Promise<Map<string, PlayerSummary>> {
  const out = new Map<string, PlayerSummary>()
  if (ids.length === 0) return out
  const cached = await safeRedis((r) => r.mget(...ids.map(key)), [] as (string | null)[])
  const missing: string[] = []
  ids.forEach((id, i) => {
    const raw = cached[i]
    if (raw) {
      try {
        out.set(id, JSON.parse(raw) as PlayerSummary)
        return
      } catch {
        /* fallthrough */
      }
    }
    missing.push(id)
  })
  if (missing.length) {
    const rows = await db
      .select({
        userId: players.userId,
        nickname: players.nickname,
        color: players.color,
        avatarUrl: players.avatarUrl,
      })
      .from(players)
      .where(inArray(players.userId, missing))
    for (const row of rows) out.set(row.userId, row)
    await safeRedis(async (r) => {
      const pipe = r.pipeline()
      for (const row of rows) pipe.set(key(row.userId), JSON.stringify(row), 'EX', TTL)
      await pipe.exec()
    }, null)
  }
  return out
}

export async function invalidatePlayerCache(userId: string) {
  await safeRedis((r) => r.del(key(userId)), 0)
}
