import { describe, expect, it } from 'vitest'
import { generateImpulseData } from './impulse'
import { seededRng } from '@/lib/random'

const rms = (a: Float32Array, from: number, to: number) => {
  let s = 0
  for (let i = from; i < to; i++) s += a[i] * a[i]
  return Math.sqrt(s / (to - from))
}

describe('generateImpulseData', () => {
  it('decays over time and stays within [-1, 1]', () => {
    const [l, r] = generateImpulseData(8000, 1, 2.4, seededRng(1))
    expect(l.length).toBe(8000)
    expect(r.length).toBe(8000)
    for (const ch of [l, r]) {
      let max = 0
      for (const v of ch) max = Math.max(max, Math.abs(v))
      expect(max).toBeLessThanOrEqual(1)
      expect(rms(ch, 0, 800)).toBeGreaterThan(rms(ch, 7200, 8000) * 5)
    }
  })
})
