import { describe, expect, it } from 'vitest'
import { createState, difficulty, hitTest, spawnEntity, tapAt, update } from './engine'
import { DURATION } from './constants'
import { seededRng } from '@/lib/random'

describe('catch engine', () => {
  it('difficulty ramps monotonically', () => {
    const a = difficulty(0)
    const b = difficulty(30)
    const c = difficulty(60)
    expect(b.spawnInterval).toBeLessThan(a.spawnInterval)
    expect(c.spawnInterval).toBeLessThanOrEqual(b.spawnInterval)
    expect(b.speed).toBeGreaterThan(a.speed)
    expect(c.cloudRatio).toBeGreaterThan(a.cloudRatio)
    expect(c.cloudRatio).toBeLessThanOrEqual(0.25)
  })

  it('moves lanterns upward and clouds downward', () => {
    const s = createState(400, 600)
    const rng = seededRng(1)
    const lantern = spawnEntity(s, rng, 'lantern')
    const cloud = spawnEntity(s, rng, 'cloud')
    const ly = lantern.y
    const cy = cloud.y
    update(s, 0.05, rng)
    expect(lantern.y).toBeLessThan(ly)
    expect(cloud.y).toBeGreaterThan(cy)
  })

  it('removes off-screen lanterns and resets combo with a miss event', () => {
    const s = createState(400, 600)
    const rng = seededRng(2)
    const e = spawnEntity(s, rng, 'lantern')
    e.y = -100
    s.combo = 3
    s.spawnAcc = -100 // prevent spawning
    const events = update(s, 0.016, rng)
    expect(s.entities.find((x) => x.id === e.id)).toBeUndefined()
    expect(s.combo).toBe(0)
    expect(events.some((ev) => ev.type === 'miss')).toBe(true)
  })

  it('hitTest picks the top-most entity within grace radius', () => {
    const s = createState(400, 600)
    const rng = seededRng(3)
    const a = spawnEntity(s, rng, 'lantern')
    const b = spawnEntity(s, rng, 'lantern')
    a.x = b.x = 200
    a.y = b.y = 300
    expect(hitTest(s, 200, 300)?.id).toBe(b.id)
    expect(hitTest(s, 200 + a.r + 10, 300)?.id).toBe(b.id)
    expect(hitTest(s, 200 + a.r + 30, 300)).toBeNull()
  })

  it('scores lanterns, doubles on combo, penalises clouds and floors at zero', () => {
    const s = createState(400, 600)
    const rng = seededRng(4)
    for (let i = 0; i < 5; i++) {
      const e = spawnEntity(s, rng, 'lantern')
      e.x = 100
      e.y = 100
      tapAt(s, 100, 100, rng)
    }
    expect(s.score).toBe(5)
    expect(s.combo).toBe(5)
    const g = spawnEntity(s, rng, 'golden')
    g.x = 100
    g.y = 100
    const ev = tapAt(s, 100, 100, rng)
    expect(ev?.type).toBe('catch')
    expect(s.score).toBe(15) // 5 + 5*2
    const c = spawnEntity(s, rng, 'cloud')
    c.x = 100
    c.y = 100
    tapAt(s, 100, 100, rng)
    expect(s.score).toBe(12)
    expect(s.combo).toBe(0)

    const s2 = createState(400, 600)
    const c2 = spawnEntity(s2, rng, 'cloud')
    c2.x = c2.y = 100
    tapAt(s2, 100, 100, rng)
    expect(s2.score).toBe(0)
  })

  it('finishes with a timeup event after DURATION', () => {
    const s = createState(400, 600)
    const rng = seededRng(5)
    const events: ReturnType<typeof update> = []
    for (let t = 0; t < DURATION + 1; t += 0.05) events.push(...update(s, 0.05, rng))
    expect(s.finished).toBe(true)
    expect(events.filter((e) => e.type === 'timeup')).toHaveLength(1)
    expect(tapAt(s, 0, 0, rng)).toBeNull()
  })
})
