export const RELEASE_DURATION = 4

export interface Vec2 {
  x: number
  y: number
}

export interface LanternPose {
  x: number
  y: number
  scale: number
  opacity: number
  tiltX: number
  rotY: number
  light: number
  emberRate: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const lerp = (a: number, b: number, u: number) => a + (b - a) * u
export const easeOutBack = (u: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2)
}
export const easeOutSine = (u: number) => Math.sin((u * Math.PI) / 2)
export const easeInOutSine = (u: number) => -(Math.cos(Math.PI * u) - 1) / 2
export const easeInQuad = (u: number) => u * u

/**
 * Pose of the released lantern at time t (seconds) in world units.
 * `start` is where it appears; `topY` is the world y just above the screen.
 */
export function lanternPose(t: number, start: Vec2, topY: number): LanternPose {
  const rotY = 0.35 * Math.max(0, t - 0.4)
  if (t <= 0.4) {
    const u = clamp01(t / 0.4)
    return {
      x: start.x,
      y: start.y,
      scale: Math.max(0, easeOutBack(u)),
      opacity: u,
      tiltX: lerp(-0.26, 0, u),
      rotY: 0,
      light: lerp(0, 2.5, u),
      emberRate: lerp(0, 20, u),
    }
  }
  if (t <= 1) {
    const u = clamp01((t - 0.4) / 0.6)
    return {
      x: start.x,
      y: start.y + 0.3 * easeOutSine(u) + Math.sin(t * 4) * 0.03,
      scale: 1,
      opacity: 1,
      tiltX: Math.sin(t * 2) * 0.06,
      rotY,
      light: 2.5,
      emberRate: lerp(20, 40, u),
    }
  }
  const riseStartY = start.y + 0.3
  const riseEndY = topY + 1.2
  if (t <= 3.4) {
    const u = clamp01((t - 1) / 2.4)
    return {
      x: lerp(start.x, 0, easeInOutSine(u)) + Math.sin((t - 1) * 1.3) * 0.45,
      y: lerp(riseStartY, riseEndY, easeInOutSine(u)),
      scale: lerp(1, 0.35, u * u),
      opacity: 1,
      tiltX: Math.sin(t * 2) * 0.05,
      rotY,
      light: 2.5,
      emberRate: lerp(40, 10, u),
    }
  }
  const u = clamp01((t - 3.4) / 0.6)
  return {
    x: Math.sin((t - 1) * 1.3) * 0.45,
    y: riseEndY + u * 0.3,
    scale: 0.35,
    opacity: 1 - easeInQuad(u),
    tiltX: 0,
    rotY,
    light: lerp(2.5, 0, u),
    emberRate: 0,
  }
}
