import { describe, expect, it } from 'vitest'
import { screenToWorld } from './screenToWorld'

describe('screenToWorld', () => {
  it('maps the centre to the origin and corners to the frustum edges', () => {
    const c = screenToWorld(600, 400, 1200, 800, 8, 45)
    expect(c.x).toBeCloseTo(0)
    expect(c.y).toBeCloseTo(0)
    const halfH = 8 * Math.tan((45 * Math.PI) / 360)
    const tl = screenToWorld(0, 0, 1200, 800, 8, 45)
    expect(tl.x).toBeCloseTo(-halfH * 1.5)
    expect(tl.y).toBeCloseTo(halfH)
  })
})
