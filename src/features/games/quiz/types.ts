import type { LocalizedText } from '@/i18n'

export type CuratedCategory =
  | 'legends'
  | 'customs'
  | 'food'
  | 'lanterns'
  | 'music-arts'
  | 'asia'
  | 'moon-astronomy'
  | 'dates-numbers'
  | 'literature'
  | 'modern'
export type GeneratedCategory =
  'gen-dates' | 'gen-vocab' | 'gen-sets' | 'gen-match' | 'gen-lunar' | 'gen-moon'
export type QuizCategory = CuratedCategory | GeneratedCategory
export type QuizDifficulty = 1 | 2 | 3
export type QuizSource = 'curated' | 'generated'

export const QUIZ_SIZE = 10

export interface QuizQuestion {
  id: string
  category: QuizCategory
  difficulty: QuizDifficulty
  source: QuizSource
  question: LocalizedText
  options: LocalizedText[]
  correctIndex: number
  explanation: LocalizedText
  emoji?: string
}

export type QuizStatus = 'idle' | 'answering' | 'revealed' | 'finished'

export interface QuizState {
  status: QuizStatus
  questions: QuizQuestion[]
  order: number[]
  optionOrders: number[][]
  current: number
  selected: number | null
  score: number
  answers: boolean[]
  startedAt: number | null
  finishedAt: number | null
}

export type QuizAction =
  | {
      type: 'START'
      questions: QuizQuestion[]
      order: number[]
      optionOrders: number[][]
      now: number
    }
  | { type: 'ANSWER'; index: number }
  | { type: 'NEXT'; now: number }
  | { type: 'RESET' }
