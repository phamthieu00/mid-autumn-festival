import { seededRng } from '../random'
import type { GameId } from './ids'
import { MAX_VALUE, MIN_ELAPSED_SEC, type FinishBody } from './rules'
import {
  POINTS as CATCH_POINTS,
  SPAWN_MIN as CATCH_SPAWN_MIN,
  DURATION as CATCH_DURATION,
} from './catch/constants'
import {
  SPEED_MAX as RUNNER_SPEED_MAX,
  DIST_POINT_DIV,
  PICKUPS as RUNNER_PICKUPS,
} from './runner/constants'
import { generateChart } from './rhythm/chart'
import { multiplier } from './rhythm/engine'
import type { Verdict } from './rhythm/types'
import { POINTS as RHYTHM_POINTS } from './rhythm/constants'
import { isSolved, posForDir, shuffleSolvable, slide } from './puzzle/puzzleLogic'
import { applyGuess, pickEntries, roundScore } from './word/wordReducer'
import { toLetter } from './word/normalize'
import type { RoundState } from './word/types'
import type { QuizQuestion } from '../quiz/types'

export type VerifyResult =
  | {
      ok: true
      value: number
      secondary: number | null
      meta: Record<string, unknown>
      flags: string[]
    }
  | { ok: false; reason: string }

const reject = (reason: string): VerifyResult => ({ ok: false, reason })

function checkElapsed(gameId: GameId, elapsedSec: number): string | null {
  return elapsedSec < MIN_ELAPSED_SEC[gameId] ? 'TOO_FAST' : null
}

export function verifyCatch(body: FinishBody<'catch'>, elapsedSec: number): VerifyResult {
  const bad = checkElapsed('catch', elapsedSec)
  if (bad) return reject(bad)
  const { lantern, golden, cloud } = body.counts
  const maxSpawns = Math.ceil(CATCH_DURATION / CATCH_SPAWN_MIN) + 10
  if (lantern + golden + cloud > maxSpawns) return reject('TOO_MANY_SPAWNS')
  if (body.maxCombo > lantern + golden) return reject('COMBO_IMPOSSIBLE')
  const maxScore = 2 * (lantern * CATCH_POINTS.lantern + golden * CATCH_POINTS.golden)
  if (body.score > maxScore || body.score > MAX_VALUE.catch) return reject('SCORE_IMPOSSIBLE')
  const flags: string[] = []
  if (elapsedSec > CATCH_DURATION * 4) flags.push('LONG_PAUSE')
  return {
    ok: true,
    value: body.score,
    secondary: null,
    meta: { counts: body.counts, maxCombo: body.maxCombo },
    flags,
  }
}

export function verifyRunner(body: FinishBody<'runner'>, elapsedSec: number): VerifyResult {
  const bad = checkElapsed('runner', elapsedSec)
  if (bad) return reject(bad)
  const maxMetres = ((RUNNER_SPEED_MAX * elapsedSec) / DIST_POINT_DIV) * 1.05 + 5
  if (body.metres > maxMetres) return reject('DISTANCE_IMPOSSIBLE')
  const pickups = body.pickups.mooncake + body.pickups.star
  if (pickups > (body.metres / 26) * 3 + 3) return reject('PICKUPS_IMPOSSIBLE')
  const value =
    body.metres +
    body.pickups.mooncake * RUNNER_PICKUPS.mooncake.points +
    body.pickups.star * RUNNER_PICKUPS.star.points
  if (value > MAX_VALUE.runner) return reject('SCORE_IMPOSSIBLE')
  return {
    ok: true,
    value,
    secondary: null,
    meta: { metres: body.metres, pickups: body.pickups },
    flags: [],
  }
}

/** Replays the judgements over the deterministic chart; the server score is authoritative. */
export function verifyRhythm(
  body: FinishBody<'rhythm'>,
  seed: number,
  elapsedSec: number,
): VerifyResult {
  const bad = checkElapsed('rhythm', elapsedSec)
  if (bad) return reject(bad)
  const chart = generateChart(seed)
  if (body.judgements.length !== chart.notes.length) return reject('JUDGEMENT_COUNT')
  let score = 0
  let combo = 0
  let maxCombo = 0
  const counts: Record<Verdict, number> = { perfect: 0, good: 0, miss: 0 }
  for (const j of body.judgements) {
    if (j === 0) {
      combo = 0
      counts.miss++
    } else {
      const verdict: 'perfect' | 'good' = j === 2 ? 'perfect' : 'good'
      score += RHYTHM_POINTS[verdict] * multiplier(combo)
      combo++
      maxCombo = Math.max(maxCombo, combo)
      counts[verdict]++
    }
  }
  return {
    ok: true,
    value: score,
    secondary: null,
    meta: { counts, maxCombo, notes: chart.notes.length },
    flags: [],
  }
}

export function verifyMatch(body: FinishBody<'match'>, elapsedSec: number): VerifyResult {
  const bad = checkElapsed('match', elapsedSec)
  if (bad) return reject(bad)
  if (body.moves < 8) return reject('MOVES_IMPOSSIBLE')
  if (body.seconds < Math.max(4, body.moves * 0.35)) return reject('TOO_FAST')
  if (elapsedSec < body.seconds * 0.9) return reject('TIME_MISMATCH')
  if (body.moves > MAX_VALUE.match) return reject('SCORE_IMPOSSIBLE')
  return { ok: true, value: body.moves, secondary: body.seconds, meta: {}, flags: [] }
}

export function verifyPuzzle(
  body: FinishBody<'puzzle'>,
  seed: number,
  elapsedSec: number,
): VerifyResult {
  const bad = checkElapsed('puzzle', elapsedSec)
  if (bad) return reject(bad)
  let tiles = shuffleSolvable(body.size, seededRng(seed))
  for (const dir of body.moves) {
    const pos = posForDir(tiles, body.size, dir)
    if (pos < 0) return reject('ILLEGAL_MOVE')
    const next = slide(tiles, body.size, pos)
    if (next === tiles) return reject('ILLEGAL_MOVE')
    tiles = next
  }
  if (!isSolved(tiles)) return reject('NOT_SOLVED')
  if (body.moves.length > MAX_VALUE.puzzle) return reject('SCORE_IMPOSSIBLE')
  const flags: string[] = []
  if (body.seconds < body.moves.length * 0.15) flags.push('FAST_MOVES')
  return { ok: true, value: body.moves.length, secondary: body.seconds, meta: {}, flags }
}

export function verifyWord(
  body: FinishBody<'word'>,
  seed: number,
  elapsedSec: number,
): VerifyResult {
  const bad = checkElapsed('word', elapsedSec)
  if (bad) return reject(bad)
  const entries = pickEntries(seededRng(seed))
  let score = 0
  let solved = 0
  body.rounds.forEach((round, i) => {
    let state: RoundState = { entry: entries[i], guessed: [], wrong: 0, status: 'playing' }
    for (const raw of round.guessed) {
      const letter = toLetter(raw)
      if (!letter) continue
      state = applyGuess(state, letter)
    }
    score += roundScore(state)
    if (state.status === 'won') solved++
  })
  return { ok: true, value: score, secondary: null, meta: { solved }, flags: [] }
}

export function gradeQuiz(
  questions: readonly QuizQuestion[],
  answers: readonly (number | null)[],
  elapsedSec: number,
): VerifyResult {
  const bad = checkElapsed('quiz', elapsedSec)
  if (bad) return reject(bad)
  if (answers.length !== questions.length) return reject('ANSWER_COUNT')
  let score = 0
  const perQuestion = questions.map((q, i) => {
    const correct = answers[i] === q.correctIndex
    if (correct) score++
    return correct
  })
  return {
    ok: true,
    value: score,
    secondary: Math.round(elapsedSec),
    meta: { perQuestion },
    flags: [],
  }
}
