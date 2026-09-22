import { describe, expect, it } from 'vitest'
import {
  IOI,
  PHRASE_MAX,
  PHRASE_MIN,
  PhraseGenerator,
  RANGE,
  REST_MAX,
  REST_MIN,
  type NoteEvent,
} from './phrase'
import { isChordTone } from './scale'
import { seededRng } from '@/lib/random'

function gen(seed: number, n: number): NoteEvent[] {
  const g = new PhraseGenerator(seededRng(seed))
  return Array.from({ length: n }, () => g.next())
}

describe('PhraseGenerator', () => {
  it('is deterministic for a seed', () => {
    expect(gen(42, 50)).toEqual(gen(42, 50))
    expect(gen(42, 50)).not.toEqual(gen(43, 50))
  })

  it('keeps plucks within range, velocity and IOI grid', () => {
    const allowed = new Set<number>([...IOI, ...IOI.map((x) => x * 1.5)])
    for (const ev of gen(7, 400)) {
      if (ev.kind !== 'pluck') continue
      expect(ev.degree).toBeGreaterThanOrEqual(0)
      expect(ev.degree).toBeLessThan(RANGE)
      expect(ev.velocity).toBeGreaterThanOrEqual(0.3)
      expect(ev.velocity).toBeLessThanOrEqual(0.8)
      expect(allowed.has(ev.offset)).toBe(true)
    }
  })

  it('produces phrases of 3–6 notes separated by rests of 2–5 s', () => {
    const events = gen(11, 600)
    let count = 0
    let phrases = 0
    let firstNotes = 0
    let firstChordTones = 0
    let atPhraseStart = true
    for (const ev of events) {
      if (ev.kind === 'pluck') {
        if (atPhraseStart) {
          firstNotes++
          if (isChordTone(ev.degree, 0)) firstChordTones++
          atPhraseStart = false
        }
        count++
      } else if (ev.kind === 'rest') {
        expect(ev.offset).toBeGreaterThanOrEqual(REST_MIN)
        expect(ev.offset).toBeLessThanOrEqual(REST_MAX)
        expect(count).toBeGreaterThanOrEqual(PHRASE_MIN)
        expect(count).toBeLessThanOrEqual(PHRASE_MAX)
        count = 0
        phrases++
        atPhraseStart = true
      }
    }
    expect(phrases).toBeGreaterThan(20)
    expect(firstChordTones / firstNotes).toBeGreaterThan(0.6)
  })

  it('never emits two rests in a row', () => {
    const events = gen(3, 500)
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].kind === 'rest' && events[i].kind === 'rest').toBe(false)
    }
  })
})
