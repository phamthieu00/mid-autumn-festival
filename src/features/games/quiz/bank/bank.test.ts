import { describe, expect, it } from 'vitest'
import { getBank, signature, validateQuestion } from './index'
import { CURATED } from './curated'
import { buildGenerated } from './generated'

describe('quiz bank', () => {
  const bank = getBank()

  it('is large enough', () => {
    expect(CURATED.length).toBeGreaterThanOrEqual(250)
    expect(bank.length).toBeGreaterThanOrEqual(1000)
    expect(bank.filter((q) => q.source === 'generated').length).toBeGreaterThanOrEqual(740)
  })

  it('has unique ids and signatures', () => {
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length)
    expect(new Set(bank.map(signature)).size).toBe(bank.length)
    for (const q of CURATED) expect(q.id).toMatch(/^c:[a-z-]+:[a-z0-9-]+$/)
  })

  it('every question is well formed in both languages', () => {
    const errors = bank.map(validateQuestion).filter(Boolean)
    expect(errors).toEqual([])
    for (const q of bank) {
      expect([1, 2, 3]).toContain(q.difficulty)
      expect(q.emoji).toBeTruthy()
    }
  })

  it('curated categories all have enough questions', () => {
    const counts = new Map<string, number>()
    for (const q of CURATED) counts.set(q.category, (counts.get(q.category) ?? 0) + 1)
    expect(counts.size).toBe(10)
    for (const n of counts.values()) expect(n).toBeGreaterThanOrEqual(15)
  })

  it('generators are deterministic', () => {
    expect(buildGenerated()).toEqual(buildGenerated())
  })
})
