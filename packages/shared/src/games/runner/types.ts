export type ObstacleKind = 'rock' | 'fence' | 'cloud'
export type PickupKind = 'mooncake' | 'star'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}
export interface Obstacle extends Box {
  id: number
  kind: ObstacleKind
}
export interface Pickup {
  id: number
  kind: PickupKind
  x: number
  y: number
  r: number
  taken: boolean
  phase: number
}
export interface Player {
  y: number
  vy: number
  jumps: number
  grounded: boolean
  sinceGround: number
  buffered: number
  runPhase: number
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
export interface RunnerState {
  w: number
  h: number
  elapsed: number
  distance: number
  speed: number
  scrollX: number
  player: Player
  obstacles: Obstacle[]
  pickups: Pickup[]
  nextSpawnX: number
  nextId: number
  collected: number
  pickupCounts: Record<PickupKind, number>
  collectPoints: number
  particles: Particle[]
  popups: Popup[]
  finished: boolean
  hitFlash: number
}
export type RunnerEvent =
  | { type: 'jump'; double: boolean }
  | { type: 'pickup'; kind: PickupKind; points: number; x: number; y: number }
  | { type: 'hit'; kind: ObstacleKind }
  | { type: 'land' }
