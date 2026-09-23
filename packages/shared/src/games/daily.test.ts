import { describe, expect, it } from 'vitest'
import { dailyKey, nextResetAt, periodKeys, weekKey } from './daily'

describe('daily keys (Asia/Ho_Chi_Minh)', () => {
  it('rolls the day over at 17:00 UTC', () => {
    expect(dailyKey(new Date('2026-09-24T16:59:00Z'))).toBe('2026-09-24')
    expect(dailyKey(new Date('2026-09-24T17:00:00Z'))).toBe('2026-09-25')
  })
  it('computes ISO weeks and period keys', () => {
    expect(weekKey(new Date('2026-09-25T10:00:00+07:00'))).toBe('2026-W39')
    expect(weekKey(new Date('2026-01-01T10:00:00+07:00'))).toBe('2026-W01')
    expect(periodKeys(new Date('2026-09-25T10:00:00+07:00'))).toEqual({
      alltime: 'alltime',
      weekly: 'w:2026-W39',
      daily: 'd:2026-09-25',
    })
  })
  it('next reset is midnight in Vietnam', () => {
    expect(nextResetAt(new Date('2026-09-25T10:00:00+07:00')).toISOString()).toBe(
      '2026-09-25T17:00:00.000Z',
    )
  })
})
