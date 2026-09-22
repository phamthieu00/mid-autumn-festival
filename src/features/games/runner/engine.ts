import {
  COYOTE_TIME,
  DIST_POINT_DIV,
  DOUBLE_JUMP_VY,
  GRAVITY,
  GROUND_RATIO,
  HITBOX_SHRINK,
  JUMP_BUFFER,
  JUMP_VY,
  OBSTACLES,
  PICKUP_HEIGHTS,
  PICKUPS,
  PLAYER,
  REACTION_TIME,
  SPEED_BASE,
  SPEED_MAX,
  SPEED_RAMP,
} from './constants'
import type { Box, Obstacle, ObstacleKind, RunnerEvent, RunnerState } from './types'

export function createState(w: number, h: number): RunnerState {
  const groundY = h * GROUND_RATIO
  return {
    w,
    h,
    elapsed: 0,
    distance: 0,
    speed: SPEED_BASE,
    scrollX: 0,
    player: {
      y: groundY - PLAYER.h,
      vy: 0,
      jumps: 0,
      grounded: true,
      sinceGround: 0,
      buffered: 0,
      runPhase: 0,
    },
    obstacles: [],
    pickups: [],
    nextSpawnX: w + 150,
    nextId: 1,
    collected: 0,
    collectPoints: 0,
    particles: [],
    popups: [],
    finished: false,
    hitFlash: 0,
  }
}

export const groundY = (s: RunnerState) => s.h * GROUND_RATIO
export const playerX = (s: RunnerState) => s.w * PLAYER.x
export const speedAt = (elapsed: number) => Math.min(SPEED_MAX, SPEED_BASE + SPEED_RAMP * elapsed)
export const score = (s: RunnerState) => Math.floor(s.distance / DIST_POINT_DIV) + s.collectPoints
export const metres = (s: RunnerState) => Math.floor(s.distance / DIST_POINT_DIV)

export function playerBox(s: RunnerState): Box {
  return {
    x: playerX(s) + HITBOX_SHRINK,
    y: s.player.y + HITBOX_SHRINK,
    w: PLAYER.w - HITBOX_SHRINK * 2,
    h: PLAYER.h - HITBOX_SHRINK * 2,
  }
}

export const aabb = (a: Box, b: Box) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export function circleBox(cx: number, cy: number, r: number, b: Box) {
  const nx = Math.max(b.x, Math.min(cx, b.x + b.w))
  const ny = Math.max(b.y, Math.min(cy, b.y + b.h))
  const dx = cx - nx
  const dy = cy - ny
  return dx * dx + dy * dy <= r * r
}

function doJump(s: RunnerState, vy: number, jumps: number) {
  s.player.vy = vy
  s.player.jumps = jumps
  s.player.grounded = false
  s.player.sinceGround = COYOTE_TIME
  s.player.buffered = 0
}

export function requestJump(s: RunnerState): RunnerEvent | null {
  if (s.finished) return null
  const p = s.player
  if (p.grounded || p.sinceGround < COYOTE_TIME) {
    doJump(s, JUMP_VY, 1)
    return { type: 'jump', double: false }
  }
  if (p.jumps < 2) {
    doJump(s, DOUBLE_JUMP_VY, 2)
    return { type: 'jump', double: true }
  }
  p.buffered = JUMP_BUFFER
  return null
}

export const minGap = (speed: number) => speed * REACTION_TIME + 100
export const gapFor = (speed: number, rng: () => number) => minGap(speed) + rng() * 280

export function pickObstacleKind(elapsed: number, rng: () => number): ObstacleKind {
  const r = rng()
  const cloudRatio = elapsed < 12 ? 0 : Math.min(0.3, (elapsed - 12) * 0.01)
  const fenceRatio = elapsed < 6 ? 0 : 0.3
  if (r < cloudRatio) return 'cloud'
  if (r < cloudRatio + fenceRatio) return 'fence'
  return 'rock'
}

export function spawnObstacle(
  s: RunnerState,
  rng: () => number,
  kind = pickObstacleKind(s.elapsed, rng),
): Obstacle {
  const def = OBSTACLES[kind]
  const o: Obstacle = {
    id: s.nextId++,
    kind,
    x: s.nextSpawnX,
    y: groundY(s) - def.h - def.yOff,
    w: def.w,
    h: def.h,
  }
  s.obstacles.push(o)
  s.nextSpawnX += gapFor(s.speed, rng)
  return o
}

export function spawnPickups(s: RunnerState, rng: () => number, from: number, to: number) {
  if (to - from < 80) return
  const count = 1 + Math.floor(rng() * 3)
  const levels = Object.values(PICKUP_HEIGHTS)
  for (let i = 0; i < count; i++) {
    const x = from + ((i + 0.5) / count) * (to - from)
    const star = rng() < 0.25
    const level = levels[Math.floor(rng() * levels.length)]
    s.pickups.push({
      id: s.nextId++,
      kind: star ? 'star' : 'mooncake',
      x,
      y: groundY(s) - level,
      r: PICKUPS[star ? 'star' : 'mooncake'].r,
      taken: false,
      phase: rng() * Math.PI * 2,
    })
  }
}

export function update(s: RunnerState, dt: number, rng: () => number): RunnerEvent[] {
  const events: RunnerEvent[] = []
  if (s.finished) {
    s.hitFlash = Math.max(0, s.hitFlash - dt)
    return events
  }
  s.elapsed += dt
  s.speed = speedAt(s.elapsed)
  s.scrollX += s.speed * dt
  s.distance = s.scrollX

  // physics
  const p = s.player
  const gy = groundY(s)
  const groundTop = gy - PLAYER.h
  p.vy += GRAVITY * dt
  p.y += p.vy * dt
  if (p.y >= groundTop) {
    const wasAir = !p.grounded
    p.y = groundTop
    p.vy = 0
    p.grounded = true
    p.jumps = 0
    p.sinceGround = 0
    if (wasAir) {
      events.push({ type: 'land' })
      if (p.buffered > 0) {
        doJump(s, JUMP_VY, 1)
        events.push({ type: 'jump', double: false })
      }
    }
  } else {
    p.grounded = false
    p.sinceGround += dt
  }
  p.buffered = Math.max(0, p.buffered - dt)
  p.runPhase += s.speed * dt * 0.02

  // spawn
  while (s.nextSpawnX < s.scrollX + s.w + 200) {
    const prev = s.obstacles[s.obstacles.length - 1]
    const from = prev ? prev.x + prev.w + 60 : s.scrollX + s.w
    const o = spawnObstacle(s, rng)
    spawnPickups(s, rng, from, o.x - 60)
  }

  // cull
  s.obstacles = s.obstacles.filter((o) => o.x + o.w > s.scrollX - 100)
  s.pickups = s.pickups.filter((k) => k.x + k.r > s.scrollX - 100)

  // collisions
  const pb = playerBox(s)
  for (const o of s.obstacles) {
    if (aabb(pb, { x: o.x - s.scrollX, y: o.y, w: o.w, h: o.h })) {
      s.finished = true
      s.hitFlash = 0.4
      events.push({ type: 'hit', kind: o.kind })
      return events
    }
  }
  for (const k of s.pickups) {
    if (k.taken) continue
    const sx = k.x - s.scrollX
    const bob = Math.sin(s.elapsed * 3 + k.phase) * 4
    if (circleBox(sx, k.y + bob, k.r, pb)) {
      k.taken = true
      const pts = PICKUPS[k.kind].points
      s.collected++
      s.collectPoints += pts
      events.push({ type: 'pickup', kind: k.kind, points: pts, x: sx, y: k.y })
      const color = k.kind === 'star' ? '#ffd166' : '#ff8c42'
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        const sp = 60 + rng() * 100
        s.particles.push({
          x: sx,
          y: k.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 40,
          life: 0.4 + rng() * 0.3,
          maxLife: 0.7,
          color,
          size: 2 + rng() * 2,
        })
      }
      s.popups.push({ x: sx, y: k.y - 14, text: `+${pts}`, life: 0.8, color })
    }
  }

  for (const pt of s.particles) {
    pt.life -= dt
    pt.x += pt.vx * dt
    pt.y += pt.vy * dt
    pt.vy += 160 * dt
  }
  s.particles = s.particles.filter((pt) => pt.life > 0)
  for (const pop of s.popups) {
    pop.life -= dt
    pop.y -= 40 * dt
  }
  s.popups = s.popups.filter((pop) => pop.life > 0)
  return events
}
