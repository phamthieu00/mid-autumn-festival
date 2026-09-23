import { describe, expect, it } from 'vitest'
import { CHORDS, chordFreqs, degreeToFreq, degreeToMidi, isChordTone } from './scale'

describe('scale', () => {
  it('maps degrees to D pentatonic frequencies', () => {
    expect(degreeToFreq(0)).toBeCloseTo(293.66, 1) // D4
    expect(degreeToFreq(3)).toBeCloseTo(440, 1) // A4
    expect(degreeToFreq(5)).toBeCloseTo(587.33, 1) // D5 (wraps octave)
    expect(degreeToFreq(0, 2)).toBeCloseTo(1174.66, 1) // D6
  })

  it('only produces pitch classes of the mode', () => {
    const allowed = new Set([2, 4, 6, 9, 11]) // D E F# A B
    for (let d = -5; d < 15; d++) expect(allowed.has(degreeToMidi(d) % 12)).toBe(true)
  })

  it('chord tones and pad frequencies stay in range', () => {
    expect(isChordTone(0, 0)).toBe(true)
    expect(isChordTone(2, 0)).toBe(false)
    expect(isChordTone(5, 0)).toBe(true) // octave wrap
    for (let i = 0; i < CHORDS.length; i++) {
      for (const f of chordFreqs(i)) {
        expect(f).toBeGreaterThan(60)
        expect(f).toBeLessThan(400)
      }
    }
  })
})
