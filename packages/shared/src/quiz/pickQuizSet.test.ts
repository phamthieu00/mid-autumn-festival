import { describe, expect, it } from 'vitest'
import { pickQuizSet } from './pickQuizSet'
import { getBank } from './bank'
import { seededRng } from '../random'
import type { QuizQuestion } from './types'

const mk = (
  id: string,
  category: QuizQuestion['category'],
  source: QuizQuestion['source'],
): QuizQuestion => ({
  id,
  category,
  source,
  difficulty: 1,
  question: { vi: id, en: id },
  options: ['a', 'b', 'c', 'd'].map((x) => ({ vi: `${id}${x}`, en: `${id}${x}` })),
  correctIndex: 0,
  explanation: { vi: 'x', en: 'x' },
})

describe('pickQuizSet', () => {
  it('returns 10 distinct questions deterministically', () => {
    const bank = getBank()
    const a = pickQuizSet(seededRng(42), bank)
    const b = pickQuizSet(seededRng(42), bank)
    expect(a).toHaveLength(10)
    expect(new Set(a.map((q) => q.id)).size).toBe(10)
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id))
  })

  it('mixes 6 curated + 4 generated and caps 2 per category', () => {
    const set = pickQuizSet(seededRng(3), getBank())
    expect(set.filter((q) => q.source === 'curated')).toHaveLength(6)
    expect(set.filter((q) => q.source === 'generated')).toHaveLength(4)
    const perCat = new Map<string, number>()
    for (const q of set) perCat.set(q.category, (perCat.get(q.category) ?? 0) + 1)
    for (const n of perCat.values()) expect(n).toBeLessThanOrEqual(2)
  })

  it('avoids recent ids when enough fresh questions remain', () => {
    const bank = getBank()
    const recent = bank.slice(0, 50).map((q) => q.id)
    const set = pickQuizSet(seededRng(9), bank, 10, { recentIds: recent })
    expect(set.some((q) => recent.includes(q.id))).toBe(false)
  })

  it('falls back to recent questions when the fresh pool is too small', () => {
    const bank = [
      ...Array.from({ length: 8 }, (_, i) => mk(`c${i}`, 'legends', 'curated')),
      ...Array.from({ length: 4 }, (_, i) => mk(`g${i}`, 'gen-dates', 'generated')),
    ]
    const recent = bank.slice(0, 8).map((q) => q.id)
    const set = pickQuizSet(seededRng(1), bank, 10, { recentIds: recent })
    expect(set).toHaveLength(10)
    expect(set.filter((q) => !recent.includes(q.id))).toHaveLength(4)
  })

  it('returns the whole bank when it is smaller than n', () => {
    const bank = [mk('a', 'food', 'curated'), mk('b', 'food', 'curated')]
    expect(pickQuizSet(seededRng(1), bank, 10)).toHaveLength(2)
  })
})
