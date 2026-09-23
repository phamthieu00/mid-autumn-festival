export type {
  CuratedCategory,
  GeneratedCategory,
  QuizCategory,
  QuizDifficulty,
  QuizSource,
  QuizQuestion,
  PublicQuizQuestion,
} from '@maf/shared/quiz/types'
export { QUIZ_SIZE } from '@maf/shared/quiz/types'
import type { LocalizedText } from '@maf/shared/i18n'
import type { QuizQuestion } from '@maf/shared/quiz/types'

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
  /** Online mode: the server reveals the answer key for one question after it was answered. */
  | { type: 'SET_KEY'; questionIndex: number; correctIndex: number; explanation: LocalizedText }
  | { type: 'ANSWER'; index: number }
  | { type: 'NEXT'; now: number }
  | { type: 'RESET' }
