import { beforeEach, describe, expect, it } from 'vitest'
import { scoresStore, isBetter } from './scoresStore'

describe('scoresStore', () => {
  beforeEach(() => {
    localStorage.clear()
    scoresStore.__clearCache()
  })

  it('accepts the first score as a record', () => {
    expect(scoresStore.submit('catch', 10)).toBe(true)
    expect(scoresStore.getBest('catch')?.value).toBe(10)
  })

  it('higher is better for catch, lower is better for match', () => {
    scoresStore.submit('catch', 10)
    expect(scoresStore.submit('catch', 5)).toBe(false)
    expect(scoresStore.submit('catch', 12)).toBe(true)

    scoresStore.submit('match', 20, 60)
    expect(scoresStore.submit('match', 25, 10)).toBe(false)
    expect(scoresStore.submit('match', 18, 90)).toBe(true)
    expect(scoresStore.getBest('match')?.value).toBe(18)
  })

  it('uses secondary (time) as tie-breaker', () => {
    const cur = { gameId: 'quiz' as const, value: 8, secondary: 50, achievedAt: 0 }
    expect(isBetter('quiz', { ...cur, secondary: 40 }, cur)).toBe(true)
    expect(isBetter('quiz', { ...cur, secondary: 60 }, cur)).toBe(false)
  })

  it('persists to localStorage with version', () => {
    scoresStore.submit('quiz', 7)
    const raw = JSON.parse(localStorage.getItem('maf:highscores') ?? '{}')
    expect(raw.version).toBe(1)
    expect(raw.scores.quiz.value).toBe(7)
    scoresStore.__clearCache()
    expect(scoresStore.getBest('quiz')?.value).toBe(7)
  })
})
