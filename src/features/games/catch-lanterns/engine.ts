import { COMBO_THRESHOLD, DURATION, GRACE, POINTS, RADIUS, SPAWN_BASE, SPAWN_MIN, SPEED_BASE } from './constants'
import type { EngineEvent, EngineState, Entity, EntityKind } from './types'

export function createState(w: number, h: number): EngineState {
  return {
    w,
    h,
    elapsed: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    caught: 0,
    entities: [],
    particles: [],
    popups: [],
    nextId: 1,
    spawnAcc: 0.6, // spawn first lantern quickly
    finished: false,
  }
}

export function difficulty(elapsed: number) {
  const t = Math.max(0, elapsed)
  return {
    spawnInterval: Math.max(SPAWN_MIN, SPAWN_BASE - t * 0.012),
    speed: SPEED_BASE * (1 + t / 60),
    cloudRatio: Math.min(0.25, 0.1 + t * 0.0025),
    goldenRatio: 0.08,
  }
}

export function pickKind(elapsed: number, rng: () => number): EntityKind {
  const d = difficulty(elapsed)
  const r = rng()
  if (r < d.cloudRatio) return 'cloud'
  if (r < d.cloudRatio + d.goldenRatio) return 'golden'
  return 'lantern'
}

export function spawnEntity(state: EngineState, rng: () => number, kind = pickKind(state.elapsed, rng)): Entity {
  const d = difficulty(state.elapsed)
  const r = RADIUS[kind]
  const margin = r + 10
  const speedJitter = 0.8 + rng() * 0.5
  const e: Entity = {
    id: state.nextId++,
    kind,
    x: margin + rng() * Math.max(1, state.w - margin * 2),
    y: kind === 'cloud' ? -r : state.h + r,
    vx: (rng() - 0.5) * 30,
    vy: kind === 'cloud' ? d.speed * 0.6 * speedJitter : -d.speed * speedJitter,
    r,
    phase: rng() * Math.PI * 2,
    hue: kind === 'golden' ? 45 : kind === 'cloud' ? 240 : 0 + rng() * 25,
    age: 0,
  }
  state.entities.push(e)
  return e
}

export function update(state: EngineState, dt: number, rng: () => number): EngineEvent[] {
  const events: EngineEvent[] = []
  if (state.finished) return events

  state.elapsed += dt
  if (state.elapsed >= DURATION) {
    state.elapsed = DURATION
    state.finished = true
    events.push({ type: 'timeup' })
    return events
  }

  // spawn
  state.spawnAcc += dt
  const { spawnInterval } = difficulty(state.elapsed)
  while (state.spawnAcc >= spawnInterval) {
    state.spawnAcc -= spawnInterval
    spawnEntity(state, rng)
  }

  // move
  for (const e of state.entities) {
    e.age += dt
    e.x += (e.vx + Math.sin(e.age * 2 + e.phase) * 40) * dt
    e.y += e.vy * dt
    if (e.x < e.r) e.x = e.r
    if (e.x > state.w - e.r) e.x = state.w - e.r
  }

  // cull
  const keep: Entity[] = []
  for (const e of state.entities) {
    const gone = e.kind === 'cloud' ? e.y - e.r > state.h : e.y + e.r < 0
    if (gone) {
      if (e.kind !== 'cloud' && state.combo > 0) {
        state.combo = 0
        events.push({ type: 'miss' })
      }
    } else {
      keep.push(e)
    }
  }
  state.entities = keep

  // particles & popups
  for (const p of state.particles) {
    p.life -= dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 140 * dt
  }
  state.particles = state.particles.filter((p) => p.life > 0)
  for (const p of state.popups) {
    p.life -= dt
    p.y -= 40 * dt
  }
  state.popups = state.popups.filter((p) => p.life > 0)

  return events
}

/** Top-most entity (last drawn) under the point, or null. */
export function hitTest(state: EngineState, x: number, y: number): Entity | null {
  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i]
    const dx = e.x - x
    const dy = e.y - y
    const rr = e.r + GRACE
    if (dx * dx + dy * dy <= rr * rr) return e
  }
  return null
}

export function pointsFor(kind: EntityKind, combo: number): number {
  const base = POINTS[kind]
  if (kind === 'cloud') return base
  return combo >= COMBO_THRESHOLD ? base * 2 : base
}

export function tapAt(state: EngineState, x: number, y: number, rng: () => number = Math.random): EngineEvent | null {
  if (state.finished) return null
  const e = hitTest(state, x, y)
  if (!e) return null

  const points = pointsFor(e.kind, state.combo)
  if (e.kind === 'cloud') {
    state.combo = 0
  } else {
    state.combo += 1
    state.caught += 1
    state.maxCombo = Math.max(state.maxCombo, state.combo)
  }
  state.score = Math.max(0, state.score + points)
  state.entities = state.entities.filter((en) => en.id !== e.id)

  // burst
  const color = e.kind === 'cloud' ? '#8b8fb3' : e.kind === 'golden' ? '#ffd166' : '#ff6b35'
  const n = e.kind === 'cloud' ? 6 : 12
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.5
    const sp = 80 + rng() * 120
    state.particles.push({
      x: e.x,
      y: e.y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: 0.5 + rng() * 0.3,
      maxLife: 0.8,
      color,
      size: 2 + rng() * 3,
    })
  }
  state.popups.push({
    x: e.x,
    y: e.y - e.r,
    text: points > 0 ? `+${points}` : `${points}`,
    life: 0.8,
    color: points > 0 ? (e.kind === 'golden' ? '#ffd166' : '#fff8dc') : '#ff8c8c',
  })

  return { type: 'catch', kind: e.kind, points, x: e.x, y: e.y, combo: state.combo }
}

export const timeLeft = (state: EngineState) => Math.max(0, DURATION - state.elapsed)
