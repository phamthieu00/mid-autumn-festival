import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildOrders,
  categoryBreakdown,
  correctDisplayIndex,
  initialQuizState,
  quizReducer,
  rankFor,
  startQuiz,
} from './quizReducer'
import { getBank } from './bank'
import { pickQuizSet } from './pickQuizSet'
import { recentStore } from './recentStore'
import { seededRng } from '@/lib/random'

describe('quizReducer', () => {
  beforeEach(() => {
    localStorage.clear()
    recentStore.__clearCache()
  })

  it('scores correct answers, blocks double answering and finishes after the last', () => {
    const rng = seededRng(7)
    const qs = pickQuizSet(rng, getBank())
    const { order, optionOrders } = buildOrders(rng, qs)
    let s = quizReducer(initialQuizState, {
      type: 'START',
      questions: qs,
      order,
      optionOrders,
      now: 1,
    })
    expect(s.status).toBe('answering')
    expect(s.questions).toHaveLength(10)

    for (let i = 0; i < qs.length; i++) {
      const correct = correctDisplayIndex(s)
      const pick = i % 2 === 0 ? correct : (correct + 1) % 4
      s = quizReducer(s, { type: 'ANSWER', index: pick })
      expect(s.status).toBe('revealed')
      expect(quizReducer(s, { type: 'ANSWER', index: correct })).toBe(s)
      s = quizReducer(s, { type: 'NEXT', now: 100 + i })
    }
    expect(s.status).toBe('finished')
    expect(s.score).toBe(5)
    expect(s.answers.filter(Boolean)).toHaveLength(5)
    const breakdown = categoryBreakdown(s)
    expect(breakdown.reduce((a, b) => a + b.total, 0)).toBe(10)
    expect(breakdown.reduce((a, b) => a + b.correct, 0)).toBe(5)
  })

  it('startQuiz picks 10 unseen questions and records them as recent', () => {
    const a = startQuiz(seededRng(1))
    expect(a.questions).toHaveLength(10)
    expect(recentStore.get()).toEqual(a.questions.map((q) => q.id))
    const b = startQuiz(seededRng(2))
    const ids = new Set(a.questions.map((q) => q.id))
    expect(b.questions.some((q) => ids.has(q.id))).toBe(false)
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
