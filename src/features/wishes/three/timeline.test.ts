import { describe, expect, it } from 'vitest'
import { lanternPose, RELEASE_DURATION } from './timeline'

const start = { x: 1, y: -2 }
const top = 4

describe('lanternPose', () => {
  it('starts invisible and ends faded out', () => {
    const a = lanternPose(0, start, top)
    expect(a.scale).toBeCloseTo(0)
    expect(a.opacity).toBe(0)
    const z = lanternPose(RELEASE_DURATION, start, top)
    expect(z.opacity).toBeCloseTo(0)
    expect(z.light).toBeCloseTo(0)
    expect(z.emberRate).toBe(0)
  })

  it('rises monotonically and shrinks to 0.35', () => {
    let prev = -Infinity
    for (let t = 1; t <= 3.4; t += 0.05) {
      const y = lanternPose(t, start, top).y
      expect(y).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = y
    }
    expect(lanternPose(3.4, start, top).scale).toBeCloseTo(0.35)
    expect(lanternPose(3.4, start, top).y).toBeCloseTo(top + 1.2)
  })

  it('is fully visible during the hover phase', () => {
    const p = lanternPose(0.7, start, top)
    expect(p.opacity).toBe(1)
    expect(p.scale).toBe(1)
    expect(p.light).toBe(2.5)
  })
})
