import { describe, expect, it } from 'vitest'
import { decodeRankScore, encodeRankScore } from './rank'

describe('rank score encoding', () => {
  it('orders higher-is-better by value then by faster time', () => {
    expect(encodeRankScore('quiz', 9, 100)).toBeGreaterThan(encodeRankScore('quiz', 8, 10))
    expect(encodeRankScore('quiz', 9, 50)).toBeGreaterThan(encodeRankScore('quiz', 9, 60))
    expect(encodeRankScore('catch', 120)).toBeGreaterThan(encodeRankScore('catch', 119))
  })

  it('orders lower-is-better by fewer moves then by faster time', () => {
    expect(encodeRankScore('match', 10, 90)).toBeGreaterThan(encodeRankScore('match', 12, 20))
    expect(encodeRankScore('puzzle', 30, 40)).toBeGreaterThan(encodeRankScore('puzzle', 30, 41))
  })

  it('round-trips and stays an exact integer', () => {
    for (const [g, v, s] of [
      ['quiz', 7, 123],
      ['match', 14, 61],
      ['runner', 5432, 0],
    ] as const) {
      const r = encodeRankScore(g, v, s)
      expect(Number.isSafeInteger(r)).toBe(true)
      expect(decodeRankScore(g, r)).toEqual({ value: v, secondary: s })
    }
  })
})
