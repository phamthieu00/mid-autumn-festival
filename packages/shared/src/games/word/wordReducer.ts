import { shuffle } from '../../random'
import { baseLetter, isLetterPos, type Letter } from './normalize'
import type { RoundState, WordAction, WordEntry, WordState } from './types'
import { WORDS } from './words'

export const MAX_WRONG = 6
export const WORDS_PER_GAME = 5
export const POINTS_PER_WORD = 10

export const initialWordState: WordState = {
  status: 'idle',
  rounds: [],
  current: 0,
  score: 0,
  solved: 0,
  lastPoints: 0,
  startedAt: null,
  finishedAt: null,
}

/** Pick n entries, preferring distinct categories. */
export function pickEntries(rng: () => number, n = WORDS_PER_GAME, words = WORDS): WordEntry[] {
  const pool = shuffle(words, rng)
  const picked: WordEntry[] = []
  const cats = new Set<string>()
  for (const e of pool) {
    if (picked.length >= n) break
    if (!cats.has(e.category)) {
      picked.push(e)
      cats.add(e.category)
    }
  }
  for (const e of pool) {
    if (picked.length >= n) break
    if (!picked.includes(e)) picked.push(e)
  }
  return picked
}

export function revealedMask(word: string, guessed: readonly Letter[]): boolean[] {
  const set = new Set<string>(guessed)
  return [...word].map((ch) => !isLetterPos(ch) || set.has(baseLetter(ch)))
}

export const isWon = (r: RoundState) => revealedMask(r.entry.word, r.guessed).every(Boolean)
export const isLost = (r: RoundState) => r.wrong >= MAX_WRONG

export function applyGuess(round: RoundState, letter: Letter): RoundState {
  if (round.status !== 'playing' || round.guessed.includes(letter)) return round
  const hit = [...round.entry.word].some((ch) => isLetterPos(ch) && baseLetter(ch) === letter)
  const next: RoundState = {
    ...round,
    guessed: [...round.guessed, letter],
    wrong: round.wrong + (hit ? 0 : 1),
  }
  if (isWon(next)) next.status = 'won'
  else if (isLost(next)) next.status = 'lost'
  return next
}

export const roundScore = (r: RoundState) =>
  r.status === 'won' ? POINTS_PER_WORD + (MAX_WRONG - r.wrong) : 0

export function wordReducer(state: WordState, action: WordAction): WordState {
  switch (action.type) {
    case 'START':
      return {
        ...initialWordState,
        status: 'playing',
        rounds: action.entries.map((entry) => ({
          entry,
          guessed: [],
          wrong: 0,
          status: 'playing',
        })),
        startedAt: action.now,
      }
    case 'RESET':
      return initialWordState
    case 'GUESS': {
      if (state.status !== 'playing') return state
      const round = state.rounds[state.current]
      const next = applyGuess(round, action.letter)
      if (next === round) return state
      const rounds = state.rounds.map((r, i) => (i === state.current ? next : r))
      if (next.status === 'playing') return { ...state, rounds }
      const pts = roundScore(next)
      return {
        ...state,
        rounds,
        status: 'roundEnd',
        score: state.score + pts,
        solved: state.solved + (next.status === 'won' ? 1 : 0),
        lastPoints: pts,
      }
    }
    case 'NEXT': {
      if (state.status !== 'roundEnd') return state
      if (state.current >= state.rounds.length - 1) {
        return { ...state, status: 'finished', finishedAt: action.now }
      }
      return { ...state, status: 'playing', current: state.current + 1 }
    }
    default:
      return state
  }
}
