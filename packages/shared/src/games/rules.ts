import { z } from 'zod'
import { GAME_IDS, type GameId } from './ids'
import { DURATION as CATCH_DURATION } from './catch/constants'
import { SONG_LENGTH } from './rhythm/constants'

export const GameIdSchema = z.enum(GAME_IDS)
export const SessionModeSchema = z.enum(['free', 'daily'])
export type SessionMode = z.infer<typeof SessionModeSchema>

const int = z.number().int().min(0)

export const CatchFinishSchema = z.object({
  score: int,
  counts: z.object({ lantern: int, golden: int, cloud: int }),
  maxCombo: int,
})
export const RunnerFinishSchema = z.object({
  metres: int,
  pickups: z.object({ mooncake: int, star: int }),
})
export const RhythmFinishSchema = z.object({
  judgements: z.array(z.union([z.literal(0), z.literal(1), z.literal(2)])).max(600),
})
export const MatchFinishSchema = z.object({ moves: int, seconds: int })
export const PuzzleFinishSchema = z.object({
  size: z.literal(3),
  moves: z.array(z.enum(['up', 'down', 'left', 'right'])).max(5000),
  seconds: int,
})
export const QuizFinishSchema = z.object({}).passthrough()
export const WordFinishSchema = z.object({
  rounds: z.array(z.object({ guessed: z.array(z.string().length(1)).max(30) })).length(5),
})

export const FINISH_SCHEMAS = {
  catch: CatchFinishSchema,
  runner: RunnerFinishSchema,
  rhythm: RhythmFinishSchema,
  match: MatchFinishSchema,
  puzzle: PuzzleFinishSchema,
  quiz: QuizFinishSchema,
  word: WordFinishSchema,
} satisfies Record<GameId, z.ZodTypeAny>

export type FinishBody<G extends GameId> = z.infer<(typeof FINISH_SCHEMAS)[G]>

/** Minimum seconds a legitimate play needs, measured server-side between start and finish. */
export const MIN_ELAPSED_SEC: Record<GameId, number> = {
  catch: CATCH_DURATION - 2,
  runner: 2,
  rhythm: SONG_LENGTH - 3,
  match: 4,
  puzzle: 3,
  quiz: 10,
  word: 10,
}

/** Hard caps used as a sanity bound in addition to per-game formulas. */
export const MAX_VALUE: Record<GameId, number> = {
  catch: 1700,
  runner: 200_000,
  rhythm: 120_000,
  match: 400,
  puzzle: 5000,
  quiz: 10,
  word: 80,
}

/** Games where every player can compete on the same seeded content. */
export const DAILY_GAMES: readonly GameId[] = GAME_IDS
