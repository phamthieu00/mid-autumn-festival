export type EntityKind = 'lantern' | 'golden' | 'cloud'

export interface Entity {
  id: number
  kind: EntityKind
  x: number
  y: number
  vx: number
  vy: number
  r: number
  phase: number
  hue: number
  age: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface Popup {
  x: number
  y: number
  text: string
  life: number
  color: string
}

export interface EngineState {
  w: number
  h: number
  elapsed: number
  score: number
  combo: number
  maxCombo: number
  caught: number
  counts: Record<EntityKind, number>
  entities: Entity[]
  particles: Particle[]
  popups: Popup[]
  nextId: number
  spawnAcc: number
  finished: boolean
}

export type EngineEvent =
  | { type: 'catch'; kind: EntityKind; points: number; x: number; y: number; combo: number }
  | { type: 'miss' }
  | { type: 'timeup' }
