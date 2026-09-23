import { and, eq, sql } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'
import type { GameId } from '@maf/shared/games/ids'
import { encodeRankScore } from '@maf/shared/games/rank'
import { periodKeys } from '@maf/shared/games/daily'
import { FINISH_SCHEMAS, type FinishBody } from '@maf/shared/games/rules'
import {
  gradeQuiz,
  verifyCatch,
  verifyMatch,
  verifyPuzzle,
  verifyRhythm,
  verifyRunner,
  verifyWord,
  type VerifyResult,
} from '@maf/shared/games/verify'
import type { QuizQuestion } from '@maf/shared/quiz/types'
import { db } from '../../db/client'
import {
  gameSessions,
  personalBests,
  scores,
  type GameSession,
  type QuizSessionPayload,
} from '../../db/schema/index'
import { ApiError } from '../../middleware/error'
import { pushToZsets, rankOf } from '../leaderboards'
import { questionById } from './start'

const publicId = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10)

export interface FinishResult {
  accepted: true
  publicId: string
  gameId: GameId
  mode: 'free' | 'daily'
  value: number
  secondary: number | null
  isPersonalBest: boolean
  ranks: { alltime: number | null; weekly: number | null; daily: number | null }
  flags: string[]
  anonymous: boolean
}

function verify(session: GameSession, body: unknown, elapsedSec: number): VerifyResult {
  const schema = FINISH_SCHEMAS[session.gameId]
  const parsed = schema.safeParse(body ?? {})
  if (!parsed.success) return { ok: false, reason: 'BAD_BODY' }
  switch (session.gameId) {
    case 'catch':
      return verifyCatch(parsed.data as FinishBody<'catch'>, elapsedSec)
    case 'runner':
      return verifyRunner(parsed.data as FinishBody<'runner'>, elapsedSec)
    case 'rhythm':
      return verifyRhythm(parsed.data as FinishBody<'rhythm'>, session.seed, elapsedSec)
    case 'match':
      return verifyMatch(parsed.data as FinishBody<'match'>, elapsedSec)
    case 'puzzle':
      return verifyPuzzle(parsed.data as FinishBody<'puzzle'>, session.seed, elapsedSec)
    case 'word':
      return verifyWord(parsed.data as FinishBody<'word'>, session.seed, elapsedSec)
    case 'quiz': {
      const payload = session.payload as QuizSessionPayload
      const questions = (payload.questionIds ?? [])
        .map((id) => questionById(id))
        .filter((q): q is QuizQuestion => !!q)
      return gradeQuiz(questions, payload.answers ?? [], elapsedSec)
    }
  }
}

export function assertOwner(session: GameSession, userId: string | null) {
  if (session.userId && session.userId !== userId) throw new ApiError(403, 'NOT_YOUR_SESSION')
}

export async function loadSession(id: string): Promise<GameSession> {
  const rows = await db.select().from(gameSessions).where(eq(gameSessions.id, id)).limit(1)
  if (!rows[0]) throw new ApiError(404, 'SESSION_NOT_FOUND')
  return rows[0]
}

export async function finishSession(
  id: string,
  userId: string | null,
  body: unknown,
): Promise<FinishResult> {
  const existing = await loadSession(id)
  assertOwner(existing, userId)
  if (existing.status !== 'started') throw new ApiError(409, 'ALREADY_FINISHED')
  if (existing.expiresAt.getTime() < Date.now()) {
    await db.update(gameSessions).set({ status: 'expired' }).where(eq(gameSessions.id, id))
    throw new ApiError(410, 'SESSION_EXPIRED')
  }

  // one finish per session: the UPDATE is the lock
  const claimed = await db
    .update(gameSessions)
    .set({ status: 'finished', finishedAt: sql`now()` })
    .where(and(eq(gameSessions.id, id), eq(gameSessions.status, 'started')))
    .returning()
  const session = claimed[0]
  if (!session) throw new ApiError(409, 'ALREADY_FINISHED')

  const elapsedSec = (session.finishedAt!.getTime() - session.startedAt.getTime()) / 1000
  const result = verify(session, body, elapsedSec)
  if (!result.ok) {
    await db
      .update(gameSessions)
      .set({
        status: 'rejected',
        flags: sql`array_append(${gameSessions.flags}, ${result.reason})`,
      })
      .where(eq(gameSessions.id, id))
    throw new ApiError(422, 'REJECTED', result.reason)
  }

  const rankScore = encodeRankScore(session.gameId, result.value, result.secondary)
  const keys = periodKeys(session.finishedAt!)
  const boardKeys =
    session.mode === 'daily' ? [keys.alltime, keys.weekly, keys.daily] : [keys.alltime, keys.weekly]

  const { pid, isPersonalBest } = await db.transaction(async (tx) => {
    const pid = publicId()
    const [score] = await tx
      .insert(scores)
      .values({
        publicId: pid,
        sessionId: session.id,
        userId: session.userId,
        gameId: session.gameId,
        mode: session.mode,
        dailyKey: session.dailyKey,
        value: result.value,
        secondary: result.secondary,
        rankScore,
        meta: { ...result.meta, elapsedSec: Math.round(elapsedSec) },
      })
      .returning({ id: scores.id })
    if (result.flags.length) {
      await tx
        .update(gameSessions)
        .set({ flags: result.flags })
        .where(eq(gameSessions.id, session.id))
    }
    let isPersonalBest = false
    if (session.userId) {
      for (const periodKey of boardKeys) {
        const updated = await tx
          .insert(personalBests)
          .values({
            userId: session.userId,
            gameId: session.gameId,
            periodKey,
            scoreId: score.id,
            rankScore,
          })
          .onConflictDoUpdate({
            target: [personalBests.userId, personalBests.gameId, personalBests.periodKey],
            set: { scoreId: score.id, rankScore, updatedAt: sql`now()` },
            setWhere: sql`${personalBests.rankScore} < ${rankScore}`,
          })
          .returning({ periodKey: personalBests.periodKey })
        if (periodKey === 'alltime' && updated.length > 0) isPersonalBest = true
      }
    }
    return { pid, isPersonalBest }
  })

  const ranks: FinishResult['ranks'] = { alltime: null, weekly: null, daily: null }
  if (session.userId) {
    await pushToZsets(session.gameId, session.userId, rankScore, boardKeys)
    const [a, w, d] = await Promise.all([
      rankOf(session.gameId, keys.alltime, session.userId),
      rankOf(session.gameId, keys.weekly, session.userId),
      session.mode === 'daily'
        ? rankOf(session.gameId, keys.daily, session.userId)
        : Promise.resolve(null),
    ])
    ranks.alltime = a?.rank ?? null
    ranks.weekly = w?.rank ?? null
    ranks.daily = d?.rank ?? null
  }

  return {
    accepted: true,
    publicId: pid,
    gameId: session.gameId,
    mode: session.mode,
    value: result.value,
    secondary: result.secondary,
    isPersonalBest,
    ranks,
    flags: result.flags,
    anonymous: !session.userId,
  }
}

export async function answerQuestion(
  id: string,
  userId: string | null,
  index: number,
  option: number,
) {
  const session = await loadSession(id)
  assertOwner(session, userId)
  if (session.gameId !== 'quiz') throw new ApiError(400, 'NOT_A_QUIZ')
  if (session.status !== 'started') throw new ApiError(409, 'ALREADY_FINISHED')
  if (session.expiresAt.getTime() < Date.now()) throw new ApiError(410, 'SESSION_EXPIRED')
  const payload = session.payload as QuizSessionPayload
  const qid = payload.questionIds?.[index]
  if (qid === undefined) throw new ApiError(400, 'BAD_QUESTION_INDEX')
  if (payload.answers[index] !== null && payload.answers[index] !== undefined)
    throw new ApiError(409, 'ALREADY_ANSWERED')
  const question = questionById(qid)
  if (!question) throw new ApiError(500, 'QUESTION_MISSING')
  if (option < 0 || option >= question.options.length) throw new ApiError(400, 'BAD_OPTION')
  const answers = [...payload.answers]
  answers[index] = option
  // optimistic concurrency on the answers array position
  await db
    .update(gameSessions)
    .set({ payload: { ...payload, answers } })
    .where(and(eq(gameSessions.id, id), eq(gameSessions.status, 'started')))
  return {
    correct: option === question.correctIndex,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    answered: answers.filter((a) => a !== null).length,
    total: answers.length,
  }
}
