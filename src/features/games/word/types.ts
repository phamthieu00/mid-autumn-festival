import type { LocalizedText } from '@/i18n'
import type { Letter } from './normalize'

export type WordCategory = 'food' | 'toy' | 'legend' | 'activity' | 'nature' | 'symbol'

export interface WordEntry {
  id: string
  word: string
  category: WordCategory
  hint: LocalizedText
}

export interface RoundState {
  entry: WordEntry
  guessed: Letter[]
  wrong: number
  status: 'playing' | 'won' | 'lost'
}

export interface WordState {
  status: 'idle' | 'playing' | 'roundEnd' | 'finished'
  rounds: RoundState[]
  current: number
  score: number
  solved: number
  lastPoints: number
  startedAt: number | null
  finishedAt: number | null
}

export type WordAction =
  | { type: 'START'; entries: WordEntry[]; now: number }
  | { type: 'GUESS'; letter: Letter }
  | { type: 'NEXT'; now: number }
  | { type: 'RESET' }
