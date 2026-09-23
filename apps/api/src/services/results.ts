import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { players, scores } from '../db/schema/index'
import { ApiError } from '../middleware/error'
import { rankOf } from './leaderboards'

export async function loadResult(publicId: string) {
  if (!/^[a-z0-9]{10}$/.test(publicId)) throw new ApiError(404, 'RESULT_NOT_FOUND')
  const rows = await db
    .select({
      score: scores,
      nickname: players.nickname,
      color: players.color,
      avatarUrl: players.avatarUrl,
    })
    .from(scores)
    .leftJoin(players, eq(players.userId, scores.userId))
    .where(eq(scores.publicId, publicId))
    .limit(1)
  const row = rows[0]
  if (!row) throw new ApiError(404, 'RESULT_NOT_FOUND')
  const rank = row.score.userId ? await rankOf(row.score.gameId, 'alltime', row.score.userId) : null
  return {
    publicId,
    gameId: row.score.gameId,
    mode: row.score.mode,
    dailyKey: row.score.dailyKey,
    value: row.score.value,
    secondary: row.score.secondary,
    createdAt: row.score.createdAt,
    player: row.score.userId
      ? {
          userId: row.score.userId,
          nickname: row.nickname,
          color: row.color ?? 'red',
          avatarUrl: row.avatarUrl,
        }
      : null,
    rank: rank?.rank ?? null,
  }
}
