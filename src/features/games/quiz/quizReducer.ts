import { shuffle } from '@/lib/random'
import { QUESTIONS } from './questions'
import type { QuizAction, QuizState } from './types'

export const initialQuizState: QuizState = {
  status: 'idle',
  order: [],
  optionOrders: [],
  current: 0,
  selected: null,
  score: 0,
  startedAt: null,
  finishedAt: null,
}

export function buildOrders(rng: () => number = Math.random, questions = QUESTIONS) {
  const order = shuffle(questions.map((_, i) => i), rng)
  const optionOrders = order.map((qi) => shuffle(questions[qi].options.map((_, i) => i), rng))
  return { order, optionOrders }
}

/** Display index of the correct option for the current question. */
export function correctDisplayIndex(state: QuizState, questions = QUESTIONS): number {
  const qi = state.order[state.current]
  return state.optionOrders[state.current].indexOf(questions[qi].correctIndex)
}

export function quizReducer(state: QuizState, action: QuizAction, questions = QUESTIONS): QuizState {
  switch (action.type) {
    case 'START':
      return {
        ...initialQuizState,
        status: 'answering',
        order: action.order,
        optionOrders: action.optionOrders,
        startedAt: action.now,
      }
    case 'RESET':
      return initialQuizState
    case 'ANSWER': {
      if (state.status !== 'answering') return state
      const correct = correctDisplayIndex(state, questions) === action.index
      return { ...state, status: 'revealed', selected: action.index, score: state.score + (correct ? 1 : 0) }
    }
    case 'NEXT': {
      if (state.status !== 'revealed') return state
      const last = state.current >= state.order.length - 1
      if (last) return { ...state, status: 'finished', finishedAt: action.now }
      return { ...state, status: 'answering', current: state.current + 1, selected: null }
    }
    default:
      return state
  }
}

export type QuizRank = 1 | 2 | 3
export function rankFor(score: number, total: number): QuizRank {
  const ratio = score / total
  if (ratio >= 0.8) return 3
  if (ratio >= 0.4) return 2
  return 1
}
