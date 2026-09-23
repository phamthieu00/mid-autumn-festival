import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import {
  gameSessions,
  personalBests,
  playerBadges,
  players,
  scores,
  user,
  wishes,
} from '../db/schema/index'
import { logger } from '../logger'
import { safeRedis } from '../redis'
import { invalidatePlayerCache } from './playerCache'

/** Everything we hold about one account, for GET /api/me/export. */
export async function exportAccount(userId: string) {
  const [account] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
  const [player] = await db.select().from(players).where(eq(players.userId, userId))
  const [scoreRows, bests, badges, wishRows, sessions] = await Promise.all([
    db
      .select({
        publicId: scores.publicId,
        gameId: scores.gameId,
        mode: scores.mode,
        dailyKey: scores.dailyKey,
        value: scores.value,
        secondary: scores.secondary,
        meta: scores.meta,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(scores.createdAt),
    db.select().from(personalBests).where(eq(personalBests.userId, userId)),
    db.select().from(playerBadges).where(eq(playerBadges.userId, userId)),
    db
      .select({
        id: wishes.id,
        text: wishes.text,
        displayName: wishes.displayName,
        color: wishes.color,
        lang: wishes.lang,
        status: wishes.status,
        createdAt: wishes.createdAt,
      })
      .from(wishes)
      .where(eq(wishes.userId, userId)),
    db
      .select({
        id: gameSessions.id,
        gameId: gameSessions.gameId,
        mode: gameSessions.mode,
        status: gameSessions.status,
        startedAt: gameSessions.startedAt,
        finishedAt: gameSessions.finishedAt,
        flags: gameSessions.flags,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId)),
  ])
  return {
    exportedAt: new Date().toISOString(),
    account,
    player: player ?? null,
    scores: scoreRows,
    personalBests: bests,
    badges,
    wishes: wishRows,
    sessions,
  }
}

async function scanKeys(r: import('ioredis').default, pattern: string) {
  const keys: string[] = []
  let cursor = '0'
  do {
    const [next, batch] = await r.scan(cursor, 'MATCH', pattern, 'COUNT', 200)
    cursor = next
    keys.push(...batch)
  } while (cursor !== '0')
  return keys
}

/**
 * DELETE /api/me: wishes become anonymous, everything else cascades from the user row,
 * then Redis loses the member from every leaderboard and the cached share images.
 */
export async function deleteAccount(userId: string, lang: 'vi' | 'en' = 'vi') {
  const myScores = await db
    .select({ publicId: scores.publicId })
    .from(scores)
    .where(eq(scores.userId, userId))
  await db.transaction(async (tx) => {
    await tx
      .update(wishes)
      .set({ userId: null, displayName: lang === 'en' ? 'Anonymous' : 'Ẩn danh' })
      .where(eq(wishes.userId, userId))
    // cascades: session, account, players, game_sessions → scores → personal_bests, player_badges
    await tx.delete(user).where(eq(user.id, userId))
  })
  await safeRedis(async (r) => {
    const boards = await scanKeys(r, 'lb:v1:*')
    const pipe = r.pipeline()
    for (const k of boards) pipe.zrem(k, userId)
    for (const s of myScores)
      for (const k of await scanKeys(r, `og:v1:${s.publicId}:*`)) pipe.del(k)
    pipe.del('wishes:recent:v1')
    await pipe.exec()
  }, undefined)
  await invalidatePlayerCache(userId)
  logger.info({ userId, scores: myScores.length }, 'account deleted')
}
