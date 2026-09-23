import { safeGet, safeSet } from '@/lib/storage'
import { HIGHER_IS_BETTER } from '@maf/shared/games/ids'

export { HIGHER_IS_BETTER }
import type { GameId, HighScore, HighScores, ScoresStorage } from './types'

const KEY = 'highscores'
const listeners = new Set<() => void>()

let cache: HighScores | null = null

function load(): HighScores {
  if (cache) return cache
  const raw = safeGet<ScoresStorage | null>(KEY, null)
  cache = raw?.version === 1 ? raw.scores : {}
  return cache
}

function persist(next: HighScores) {
  cache = next
  safeSet<ScoresStorage>(KEY, { version: 1, scores: next })
  listeners.forEach((l) => l())
}

export function isBetter(gameId: GameId, candidate: HighScore, current?: HighScore): boolean {
  if (!current) return true
  const higher = HIGHER_IS_BETTER[gameId]
  if (candidate.value !== current.value) {
    return higher ? candidate.value > current.value : candidate.value < current.value
  }
  if (candidate.secondary != null && current.secondary != null) {
    return candidate.secondary < current.secondary
  }
  return false
}

export const scoresStore = {
  getAll: (): HighScores => load(),
  getBest: (gameId: GameId): HighScore | undefined => load()[gameId],
  /** Returns true when the score is a new record. */
  submit(gameId: GameId, value: number, secondary?: number): boolean {
    const candidate: HighScore = { gameId, value, secondary, achievedAt: Date.now() }
    const current = load()[gameId]
    if (!isBetter(gameId, candidate, current)) return false
    persist({ ...load(), [gameId]: candidate })
    return true
  },
  reset() {
    persist({})
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  /** test helper */
  __clearCache() {
    cache = null
  },
}
