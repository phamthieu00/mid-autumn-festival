import { describe, expect, it } from 'vitest'
import {
  buildOrders,
  correctDisplayIndex,
  initialQuizState,
  quizReducer,
  rankFor,
} from './quizReducer'
import { QUESTIONS } from './questions'
import { seededRng } from '@/lib/random'

describe('quizReducer', () => {
  it('has 10 questions with 4 options and valid correctIndex', () => {
    expect(QUESTIONS).toHaveLength(10)
    for (const q of QUESTIONS) {
      expect(q.options).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect(q.question.vi && q.question.en).toBeTruthy()
    }
  })

  it('scores correct answers, blocks double answering and finishes after last', () => {
    const { order, optionOrders } = buildOrders(seededRng(7))
    let s = quizReducer(initialQuizState, { type: 'START', order, optionOrders, now: 1 })
    expect(s.status).toBe('answering')

    for (let i = 0; i < QUESTIONS.length; i++) {
      const correct = correctDisplayIndex(s)
      const pick = i % 2 === 0 ? correct : (correct + 1) % 4
      s = quizReducer(s, { type: 'ANSWER', index: pick })
      expect(s.status).toBe('revealed')
      const again = quizReducer(s, { type: 'ANSWER', index: correct })
      expect(again).toBe(s)
      s = quizReducer(s, { type: 'NEXT', now: 100 + i })
    }
    expect(s.status).toBe('finished')
    expect(s.score).toBe(5)
    expect(s.finishedAt).toBe(100 + QUESTIONS.length - 1)
  })

  it('ranks by ratio', () => {
    expect(rankFor(0, 10)).toBe(1)
    expect(rankFor(3, 10)).toBe(1)
    expect(rankFor(4, 10)).toBe(2)
    expect(rankFor(7, 10)).toBe(2)
    expect(rankFor(8, 10)).toBe(3)
    expect(rankFor(10, 10)).toBe(3)
  })
})
