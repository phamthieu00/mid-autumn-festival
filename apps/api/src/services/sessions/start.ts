import { and, eq } from 'drizzle-orm'
import { seededRng } from '@maf/shared/random'
import type { GameId } from '@maf/shared/games/ids'
import type { SessionMode } from '@maf/shared/games/rules'
import { dailyKey as vnDailyKey } from '@maf/shared/games/daily'
import { getBank } from '@maf/shared/quiz/bank/index'
import { pickQuizSet } from '@maf/shared/quiz/pickQuizSet'
import { QUIZ_SIZE, type PublicQuizQuestion, type QuizQuestion } from '@maf/shared/quiz/types'
import { db } from '../../db/client'
import { dailyChallenges, gameSessions, type QuizSessionPayload } from '../../db/schema/index'
import { env } from '../../env'
import { ApiError } from '../../middleware/error'
import { safeRedis } from '../../redis'
import { dailySeed, randomSeed } from '../seeds'

export interface StartResult {
  sessionId: string
  gameId: GameId
  mode: SessionMode
  seed: number
  dailyKey: string | null
  expiresAt: string
  quiz?: PublicQuizQuestion[]
}

const bankById = () => {
  const map = new Map<string, QuizQuestion>()
  for (const q of getBank()) map.set(q.id, q)
  return map
}
let bankIndex: Map<string, QuizQuestion> | null = null
export const questionById = (id: string) => (bankIndex ??= bankById()).get(id)

export const toPublic = (q: QuizQuestion): PublicQuizQuestion => {
  const { correctIndex: _c, explanation: _e, ...pub } = q
  void _c
  void _e
  return pub
}

const recentKey = (userId: string) => `quiz:recent:v1:${userId}`

async function pickFreeQuiz(userId: string | null) {
  const recent = userId
    ? await safeRedis((r) => r.lrange(recentKey(userId), 0, -1), [] as string[])
    : []
  const picked = pickQuizSet(Math.random, getBank(), QUIZ_SIZE, { recentIds: recent })
  if (userId) {
    await safeRedis(async (r) => {
      const k = recentKey(userId)
      await r.rpush(k, ...picked.map((q) => q.id))
      await r.ltrim(k, -60, -1)
      await r.expire(k, 30 * 86_400)
    }, null)
  }
  return picked
}

async function getOrCreateDaily(dailyKey: string, gameId: GameId) {
  const existing = await db
    .select()
    .from(dailyChallenges)
    .where(and(eq(dailyChallenges.dailyKey, dailyKey), eq(dailyChallenges.gameId, gameId)))
    .limit(1)
  if (existing[0]) return existing[0]
  const seed = dailySeed(dailyKey, gameId)
  const payload =
    gameId === 'quiz'
      ? { questionIds: pickQuizSet(seededRng(seed), getBank(), QUIZ_SIZE).map((q) => q.id) }
      : {}
  await db.insert(dailyChallenges).values({ dailyKey, gameId, seed, payload }).onConflictDoNothing()
  const row = await db
    .select()
    .from(dailyChallenges)
    .where(and(eq(dailyChallenges.dailyKey, dailyKey), eq(dailyChallenges.gameId, gameId)))
    .limit(1)
  return row[0]
}

export async function startSession(opts: {
  userId: string | null
  gameId: GameId
  mode: SessionMode
  ipHash: string | null
}): Promise<StartResult> {
  const { userId, gameId, mode, ipHash } = opts
  let seed = randomSeed()
  let dailyKey: string | null = null
  let quizQuestions: QuizQuestion[] | null = null

  if (mode === 'daily') {
    if (!userId) throw new ApiError(401, 'LOGIN_REQUIRED', 'Daily challenge needs an account')
    dailyKey = vnDailyKey()
    const played = await db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.userId, userId),
          eq(gameSessions.gameId, gameId),
          eq(gameSessions.mode, 'daily'),
          eq(gameSessions.dailyKey, dailyKey),
          eq(gameSessions.status, 'finished'),
        ),
      )
      .limit(1)
    if (played[0])
      throw new ApiError(409, 'ALREADY_PLAYED', 'Daily challenge already completed today')
    const challenge = await getOrCreateDaily(dailyKey, gameId)
    seed = challenge.seed
    if (gameId === 'quiz') {
      quizQuestions = (challenge.payload.questionIds ?? [])
        .map((id) => questionById(id))
        .filter((q): q is QuizQuestion => !!q)
    }
  } else if (gameId === 'quiz') {
    quizQuestions = await pickFreeQuiz(userId)
  }

  const payload: QuizSessionPayload | Record<string, never> = quizQuestions
    ? { questionIds: quizQuestions.map((q) => q.id), answers: quizQuestions.map(() => null) }
    : {}
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_MINUTES * 60_000)
  const [row] = await db
    .insert(gameSessions)
    .values({ userId, gameId, mode, dailyKey, seed, payload, expiresAt, ipHash })
    .returning({ id: gameSessions.id })

  return {
    sessionId: row.id,
    gameId,
    mode,
    seed,
    dailyKey,
    expiresAt: expiresAt.toISOString(),
    quiz: quizQuestions?.map(toPublic),
  }
}
