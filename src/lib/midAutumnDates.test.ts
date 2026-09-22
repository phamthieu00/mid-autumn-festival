import { describe, expect, it } from 'vitest'
import { getNextMidAutumn, isMidAutumnNight, vnMidnight } from './midAutumnDates'

describe('midAutumnDates', () => {
  it('vnMidnight converts to 17:00 UTC of the previous day', () => {
    expect(vnMidnight('2026-09-25').toISOString()).toBe('2026-09-24T17:00:00.000Z')
  })

  it('returns 2026 when before the date', () => {
    const info = getNextMidAutumn(new Date('2026-09-22T10:00:00+07:00'))
    expect(info?.year).toBe(2026)
    expect(info?.isTonight).toBe(false)
  })

  it('marks tonight when within the festival day (VN time)', () => {
    const info = getNextMidAutumn(new Date('2026-09-25T20:00:00+07:00'))
    expect(info?.year).toBe(2026)
    expect(info?.isTonight).toBe(true)
    expect(isMidAutumnNight(new Date('2026-09-25T00:30:00+07:00'))).toBe(true)
  })

  it('rolls over to 2027 after the festival day ends', () => {
    const info = getNextMidAutumn(new Date('2026-09-26T00:00:01+07:00'))
    expect(info?.year).toBe(2027)
    expect(info?.isTonight).toBe(false)
  })

  it('returns null when beyond the table', () => {
    expect(getNextMidAutumn(new Date('2031-01-01T00:00:00Z'))).toBeNull()
  })
})
