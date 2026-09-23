import { shuffle } from '@maf/shared/random'
import { getBank } from '@maf/shared/quiz/bank/index'
import { pickQuizSet } from '@maf/shared/quiz/pickQuizSet'
import { recentStore } from './recentStore'
import { QUIZ_SIZE, type QuizAction, type QuizQuestion, type QuizState } from './types'

export const initialQuizState: QuizState = {
  status: 'idle',
  questions: [],
  order: [],
  optionOrders: [],
  current: 0,
  selected: null,
  score: 0,
  answers: [],
  startedAt: null,
  finishedAt: null,
}

export function buildOrders(rng: () => number, questions: readonly QuizQuestion[]) {
  const order = shuffle(
    questions.map((_, i) => i),
    rng,
  )
  const optionOrders = order.map((qi) =>
    shuffle(
      questions[qi].options.map((_, i) => i),
      rng,
    ),
  )
  return { order, optionOrders }
}

/** Pick a fresh set from the bank, remember it, and build the START action. */
export function startQuiz(
  rng: () => number = Math.random,
  bank: readonly QuizQuestion[] = getBank(),
): Extract<QuizAction, { type: 'START' }> {
  const questions = pickQuizSet(rng, bank, QUIZ_SIZE, { recentIds: recentStore.get() })
  recentStore.push(questions.map((q) => q.id))
  return { type: 'START', questions, ...buildOrders(rng, questions), now: Date.now() }
}

export function currentQuestion(state: QuizState): QuizQuestion {
  return state.questions[state.order[state.current]]
}

/** Display index of the correct option for the current question. */
export function correctDisplayIndex(state: QuizState): number {
  return state.optionOrders[state.current].indexOf(currentQuestion(state).correctIndex)
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return {
        ...initialQuizState,
        status: 'answering',
        questions: action.questions,
        order: action.order,
        optionOrders: action.optionOrders,
        startedAt: action.now,
      }
    case 'RESET':
      return initialQuizState
    case 'ANSWER': {
      if (state.status !== 'answering') return state
      const correct = correctDisplayIndex(state) === action.index
      return {
        ...state,
        status: 'revealed',
        selected: action.index,
        score: state.score + (correct ? 1 : 0),
        answers: [...state.answers, correct],
      }
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
  const ratio = total > 0 ? score / total : 0
  if (ratio >= 0.8) return 3
  if (ratio >= 0.4) return 2
  return 1
}

/** Per-category tally of the answered questions, in question order. */
export function categoryBreakdown(
  state: QuizState,
): { category: string; correct: number; total: number }[] {
  const map = new Map<string, { correct: number; total: number }>()
  state.answers.forEach((ok, i) => {
    const q = state.questions[state.order[i]]
    const entry = map.get(q.category) ?? { correct: 0, total: 0 }
    entry.total++
    if (ok) entry.correct++
    map.set(q.category, entry)
  })
  return [...map.entries()].map(([category, v]) => ({ category, ...v }))
}
