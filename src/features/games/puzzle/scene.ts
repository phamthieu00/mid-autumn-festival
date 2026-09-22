import { seededRng } from '@/lib/random'

/** Draws the moonlit picture used for the puzzle onto `ctx` (square of `size` px). */
export function drawMoonScene(ctx: CanvasRenderingContext2D, size: number, seed = 7) {
  const rng = seededRng(seed)
  const s = size
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, s)
  sky.addColorStop(0, '#0b1026')
  sky.addColorStop(0.55, '#1f2a5c')
  sky.addColorStop(1, '#2c3a7a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, s, s)

  // stars
  for (let i = 0; i < 90; i++) {
    const x = rng() * s
    const y = rng() * s * 0.7
    const r = 0.6 + rng() * 1.6
    ctx.fillStyle = `rgba(255,244,214,${0.4 + rng() * 0.6})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // moon
  const mx = s * 0.7
  const my = s * 0.28
  const mr = s * 0.17
  const glow = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.6)
  glow.addColorStop(0, 'rgba(255,209,102,0.55)')
  glow.addColorStop(1, 'rgba(255,209,102,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, s, s)
  const moon = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr)
  moon.addColorStop(0, '#fffbe9')
  moon.addColorStop(0.5, '#ffe9a8')
  moon.addColorStop(1, '#e0a52a')
  ctx.fillStyle = moon
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(184,134,11,0.28)'
  for (const [dx, dy, rr] of [
    [-0.35, -0.25, 0.14],
    [0.25, 0.2, 0.18],
    [-0.2, 0.35, 0.09],
    [0.3, -0.35, 0.07],
  ]) {
    ctx.beginPath()
    ctx.arc(mx + dx * mr, my + dy * mr, rr * mr, 0, Math.PI * 2)
    ctx.fill()
  }

  // thin clouds
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  for (let i = 0; i < 4; i++) {
    const cx = rng() * s
    const cy = s * (0.15 + rng() * 0.35)
    ctx.beginPath()
    ctx.ellipse(cx, cy, s * (0.12 + rng() * 0.1), s * 0.02, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // hills
  const hill = (base: number, amp: number, k: number, color: string, phase: number) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, s)
    for (let x = 0; x <= s; x += 4) {
      const y = base - amp * Math.sin(x * k + phase) - amp * 0.5 * Math.sin(x * k * 2.3 + phase * 2)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(s, s)
    ctx.closePath()
    ctx.fill()
  }
  hill(s * 0.74, s * 0.04, 0.012, '#141b3d', 1.2)
  hill(s * 0.84, s * 0.035, 0.018, '#0b1026', 2.8)

  // banyan silhouette with Cuội
  const tx = s * 0.22
  const ty = s * 0.8
  ctx.fillStyle = '#070a1a'
  ctx.fillRect(tx - s * 0.015, ty - s * 0.22, s * 0.03, s * 0.24)
  for (const [dx, dy, rr] of [
    [0, -0.3, 0.09],
    [-0.08, -0.25, 0.07],
    [0.08, -0.26, 0.075],
    [-0.04, -0.34, 0.06],
    [0.05, -0.35, 0.055],
  ]) {
    ctx.beginPath()
    ctx.arc(tx + dx * s, ty + dy * s, rr * s, 0, Math.PI * 2)
    ctx.fill()
  }
  // Cuội sitting
  ctx.beginPath()
  ctx.arc(tx + s * 0.05, ty - s * 0.06, s * 0.018, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(tx + s * 0.035, ty - s * 0.045, s * 0.03, s * 0.04)

  // lanterns
  const lantern = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.2)
    g.addColorStop(0, 'rgba(255,140,66,0.6)')
    g.addColorStop(1, 'rgba(255,140,66,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 1.2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#b8860b'
    ctx.fillRect(x - r * 0.5, y - r * 1.4, r, r * 0.25)
    ctx.fillRect(x - r * 0.5, y + r * 1.15, r, r * 0.25)
  }
  lantern(s * 0.48, s * 0.55, s * 0.025, '#e63946')
  lantern(s * 0.6, s * 0.66, s * 0.02, '#ff6b35')
  lantern(s * 0.36, s * 0.62, s * 0.018, '#f4c15d')
}

const cache = new Map<string, string>()

/** Renders the scene once to an offscreen canvas and returns a data URL (memoised). */
export function renderSceneDataUrl(size = 600, seed = 7): string {
  const key = `${size}:${seed}`
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  drawMoonScene(ctx, size, seed)
  const url = canvas.toDataURL('image/png')
  cache.set(key, url)
  return url
}
