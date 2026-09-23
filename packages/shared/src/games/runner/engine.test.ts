import { describe, expect, it } from 'vitest'
import {
  aabb,
  circleBox,
  createState,
  groundY,
  minGap,
  playerBox,
  requestJump,
  score,
  spawnObstacle,
  speedAt,
  update,
} from './engine'
import { COYOTE_TIME, DOUBLE_JUMP_VY, JUMP_VY, PLAYER, SPEED_MAX } from './constants'
import { seededRng } from '../../random'
import type { RunnerEvent } from './types'

const dbl = (e: RunnerEvent | null) => (e?.type === 'jump' ? e.double : undefined)

describe('runner engine', () => {
  it('speed ramps and caps', () => {
    expect(speedAt(10)).toBeGreaterThan(speedAt(0))
    expect(speedAt(1000)).toBe(SPEED_MAX)
  })

  it('jump, double jump, buffer and coyote time', () => {
    const s = createState(800, 450)
    expect(dbl(requestJump(s))).toBe(false)
    expect(s.player.vy).toBe(JUMP_VY)
    expect(dbl(requestJump(s))).toBe(true)
    expect(s.player.vy).toBe(DOUBLE_JUMP_VY)
    expect(requestJump(s)).toBeNull()
    expect(s.player.buffered).toBeGreaterThan(0)

    const c = createState(800, 450)
    c.player.grounded = false
    c.player.sinceGround = COYOTE_TIME / 2
    expect(dbl(requestJump(c))).toBe(false)
    const late = createState(800, 450)
    late.player.grounded = false
    late.player.sinceGround = COYOTE_TIME * 2
    expect(dbl(requestJump(late))).toBe(true)
  })

  it('falls back to the ground and emits land', () => {
    const s = createState(800, 450)
    s.nextSpawnX = 1e9
    requestJump(s)
    let landed = false
    for (let i = 0; i < 200 && !landed; i++)
      landed = update(s, 0.016, seededRng(1)).some((e) => e.type === 'land')
    expect(landed).toBe(true)
    expect(s.player.y).toBeCloseTo(groundY(s) - PLAYER.h)
    expect(s.player.jumps).toBe(0)
  })

  it('collision helpers respect the shrunken hitbox', () => {
    const s = createState(800, 450)
    const pb = playerBox(s)
    expect(aabb(pb, { x: pb.x + pb.w - 1, y: pb.y, w: 10, h: 10 })).toBe(true)
    expect(aabb(pb, { x: pb.x + pb.w + 1, y: pb.y, w: 10, h: 10 })).toBe(false)
    expect(circleBox(pb.x - 5, pb.y + 5, 6, pb)).toBe(true)
    expect(circleBox(pb.x - 20, pb.y + 5, 6, pb)).toBe(false)
  })

  it('spawns obstacles with a reaction gap and pickups clear of them', () => {
    const s = createState(800, 450)
    const rng = seededRng(3)
    for (let t = 0; t < 30; t += 0.016) {
      const before = s.obstacles.slice()
      requestJump(s) // keep jumping to survive most things
      update(s, 0.016, rng)
      if (s.finished) break
      const news = s.obstacles.filter((o) => !before.includes(o))
      for (const o of news) {
        const prev = s.obstacles[s.obstacles.indexOf(o) - 1]
        if (prev)
          expect(o.x - (prev.x + prev.w)).toBeGreaterThanOrEqual(minGap(s.speed) - prev.w - 1)
      }
    }
    for (const k of s.pickups) {
      for (const o of s.obstacles) {
        expect(k.x > o.x - 70 && k.x < o.x + o.w + 70).toBe(false)
      }
    }
  })

  it('hitting a rock ends the game, clouds are only hit when airborne', () => {
    const s = createState(800, 450)
    s.nextSpawnX = 1e9
    const rock = spawnObstacle(s, seededRng(1), 'rock')
    rock.x = s.w * PLAYER.x + 5
    s.nextSpawnX = 1e9
    const events = update(s, 0.001, seededRng(1))
    expect(s.finished).toBe(true)
    expect(events.some((e) => e.type === 'hit')).toBe(true)
    expect(update(s, 0.016, seededRng(1))).toEqual([])

    const c = createState(800, 450)
    c.nextSpawnX = 1e9
    const cloud = spawnObstacle(c, seededRng(1), 'cloud')
    cloud.x = c.w * PLAYER.x
    c.nextSpawnX = 1e9
    update(c, 0.001, seededRng(1))
    expect(c.finished).toBe(false) // running underneath
    c.player.y = groundY(c) - PLAYER.h - 90
    c.player.vy = 0
    update(c, 0.001, seededRng(1))
    expect(c.finished).toBe(true)
  })

  it('collects pickups and scores distance', () => {
    const s = createState(800, 450)
    s.nextSpawnX = 1e9
    s.pickups.push({
      id: 99,
      kind: 'mooncake',
      x: s.w * PLAYER.x + 10,
      y: groundY(s) - 20,
      r: 12,
      taken: false,
      phase: 0,
    })
    const ev = update(s, 0.01, seededRng(1))
    expect(ev.some((e) => e.type === 'pickup')).toBe(true)
    expect(s.collectPoints).toBe(1)
    expect(score(s)).toBe(Math.floor(s.distance / 10) + 1)
  })
})
