import { beforeEach, describe, expect, it } from 'vitest'
import { RECENT_CAP, recentStore } from './recentStore'

describe('recentStore', () => {
  beforeEach(() => {
    localStorage.clear()
    recentStore.__clearCache()
  })

  it('keeps only the newest ids up to the cap, without duplicates', () => {
    recentStore.push(Array.from({ length: 70 }, (_, i) => `q${i}`))
    expect(recentStore.get()).toHaveLength(RECENT_CAP)
    expect(recentStore.get()[0]).toBe('q10')
    recentStore.push(['q10', 'new'])
    const ids = recentStore.get()
    expect(ids.filter((id) => id === 'q10')).toHaveLength(1)
    expect(ids[ids.length - 1]).toBe('new')
  })

  it('persists across cache resets', () => {
    recentStore.push(['a', 'b'])
    recentStore.__clearCache()
    expect(recentStore.get()).toEqual(['a', 'b'])
    expect(JSON.parse(localStorage.getItem('maf:quiz-recent') ?? '{}').version).toBe(1)
  })
})
