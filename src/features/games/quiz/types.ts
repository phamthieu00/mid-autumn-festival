import type { LocalizedText } from '@/i18n'

export interface QuizQuestion {
  id: string
  question: LocalizedText
  options: LocalizedText[]
  correctIndex: number
  explanation: LocalizedText
  emoji?: string
}

export type QuizStatus = 'idle' | 'answering' | 'revealed' | 'finished'

export interface QuizState {
  status: QuizStatus
  order: number[]
  optionOrders: number[][]
  current: number
  selected: number | null
  score: number
  startedAt: number | null
  finishedAt: number | null
}

export type QuizAction =
  | { type: 'START'; order: number[]; optionOrders: number[][]; now: number }
  | { type: 'ANSWER'; index: number }
  | { type: 'NEXT'; now: number }
  | { type: 'RESET' }
