import { describe, expect, it } from 'vitest'
import { generateChart } from './chart'
import { advance, applyHit, createState, judge, multiplier, noteY } from './engine'
import { APPROACH, LEAD_IN } from './constants'

describe('rhythm chart', () => {
  it('is deterministic per seed and well formed', () => {
    const a = generateChart(7)
    expect(a).toEqual(generateChart(7))
    expect(a.notes).not.toEqual(generateChart(8).notes)
    expect(a.notes.length).toBeGreaterThanOrEqual(100)
    expect(a.notes.length).toBeLessThanOrEqual(230)
    for (let i = 1; i < a.notes.length; i++)
      expect(a.notes[i].time).toBeGreaterThanOrEqual(a.notes[i - 1].time)
    expect(a.notes[0].time).toBeGreaterThanOrEqual(LEAD_IN)
    expect(a.notes[a.notes.length - 1].time).toBeLessThan(a.duration)
  })

  it('keeps same-lane gaps >= 0.25s and at most 2 simultaneous lanes', () => {
    const c = generateChart(3)
    for (let lane = 0; lane < 3; lane++) {
      const ts = c.notes.filter((n) => n.lane === lane).map((n) => n.time)
      for (let i = 1; i < ts.length; i++)
        expect(ts[i] - ts[i - 1]).toBeGreaterThanOrEqual(0.25 - 1e-9)
    }
    const byTime = new Map<number, number>()
    for (const n of c.notes) byTime.set(n.time, (byTime.get(n.time) ?? 0) + 1)
    for (const count of byTime.values()) expect(count).toBeLessThanOrEqual(2)
  })
})

describe('rhythm engine', () => {
  it('judges timing windows and multipliers', () => {
    expect(judge(0.03)).toBe('perfect')
    expect(judge(-0.08)).toBe('good')
    expect(judge(0.14)).toBe('miss')
    expect(judge(0.2)).toBeNull()
    expect(multiplier(9)).toBe(1)
    expect(multiplier(10)).toBe(2)
    expect(multiplier(25)).toBe(3)
    expect(multiplier(50)).toBe(4)
  })

  it('scores hits, ignores empty taps and auto-misses', () => {
    const chart = generateChart(1)
    const s = createState(chart)
    const first = chart.notes.find((n) => n.lane === 0)!
    expect(applyHit(s, 0, first.time - 1)).toBeNull()
    expect(s.score).toBe(0)
    expect(applyHit(s, 0, first.time + 0.02)).toBe('perfect')
    expect(s.score).toBe(100)
    expect(s.combo).toBe(1)
    expect(s.nextIdx[0]).toBe(1)

    const misses = advance(s, first.time + 5)
    expect(misses.length).toBeGreaterThan(0)
    expect(s.combo).toBe(0)
    advance(s, chart.duration + 1)
    expect(s.finished).toBe(true)
    expect(applyHit(s, 1, chart.duration)).toBeNull()
  })

  it('maps note time to y', () => {
    const note = { id: 1, time: 10, lane: 0 as const }
    expect(noteY(note, 10, 400)).toBe(400)
    expect(noteY(note, 10 - APPROACH, 400)).toBeCloseTo(0)
  })
})
