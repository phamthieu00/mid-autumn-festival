export const GRAVITY = 1900
export const JUMP_VY = -640
export const DOUBLE_JUMP_VY = -540
export const COYOTE_TIME = 0.08
export const JUMP_BUFFER = 0.1
export const SPEED_BASE = 260
export const SPEED_RAMP = 7
export const SPEED_MAX = 620
export const GROUND_RATIO = 0.78
export const PLAYER = { x: 0.22, w: 26, h: 44 } as const
export const HITBOX_SHRINK = 4
export const OBSTACLES = {
  rock: { w: 34, h: 30, yOff: 0 },
  fence: { w: 18, h: 48, yOff: 0 },
  cloud: { w: 64, h: 30, yOff: 76 },
} as const
export const PICKUPS = { mooncake: { r: 12, points: 1 }, star: { r: 12, points: 3 } } as const
export const PICKUP_HEIGHTS = { low: 34, mid: 96, high: 150 } as const
export const REACTION_TIME = 0.6
export const DIST_POINT_DIV = 10
