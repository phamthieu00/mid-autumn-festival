import { seededRng } from '@/lib/random'
import { PLAYER } from './constants'
import { groundY, playerX } from './engine'
import type { Obstacle, Pickup, RunnerState } from './types'

const STARS = Array.from({ length: 60 }, (_, i) => {
  const rng = seededRng(42 + i)
  return { x: rng(), y: rng() * 0.6, r: 0.6 + rng() * 1.4, phase: rng() * 6 }
})

function hillY(x: number, base: number, amp: number, k: number, phase: number) {
  return base - amp * Math.sin(x * k + phase) - amp * 0.5 * Math.sin(x * k * 2.1 + phase * 1.7)
}

function drawHills(
  ctx: CanvasRenderingContext2D,
  s: RunnerState,
  offset: number,
  base: number,
  amp: number,
  k: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, s.h)
  for (let x = 0; x <= s.w + 8; x += 8) ctx.lineTo(x, hillY(x + offset, base, amp, k, 1.3))
  ctx.lineTo(s.w, s.h)
  ctx.closePath()
  ctx.fill()
}

function drawStarShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fill()
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: RunnerState, reduced: boolean) {
  const x = playerX(s)
  const y = s.player.y
  const w = PLAYER.w
  const h = PLAYER.h
  const air = !s.player.grounded
  const ph = s.player.runPhase
  const legSwing = air ? 0.5 : Math.sin(ph) * 0.8

  ctx.save()
  ctx.translate(x + w / 2, y)
  // legs
  ctx.strokeStyle = '#2b1d3a'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  for (const dir of [1, -1]) {
    ctx.beginPath()
    ctx.moveTo(0, h - 16)
    ctx.lineTo(dir * legSwing * 9, h - 2)
    ctx.stroke()
  }
  // body (red áo)
  ctx.fillStyle = '#e63946'
  ctx.beginPath()
  ctx.roundRect(-9, 14, 18, 20, 5)
  ctx.fill()
  // head
  ctx.fillStyle = '#ffd9b3'
  ctx.beginPath()
  ctx.arc(0, 8, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2b1d3a'
  ctx.beginPath()
  ctx.arc(0, 5, 9, Math.PI, Math.PI * 2)
  ctx.fill()
  // arm + pole
  const swing = reduced ? 0 : Math.sin(s.elapsed * 6) * 0.15
  ctx.strokeStyle = '#ffd9b3'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(6, 18)
  ctx.lineTo(16, 10)
  ctx.stroke()
  ctx.save()
  ctx.translate(16, 10)
  ctx.rotate(-Math.PI / 4 + swing)
  ctx.strokeStyle = '#b8860b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, -26)
  ctx.stroke()
  // star lantern
  const g = ctx.createRadialGradient(0, -34, 2, 0, -34, 30)
  g.addColorStop(0, 'rgba(255,209,102,0.5)')
  g.addColorStop(1, 'rgba(255,209,102,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, -34, 30, 0, Math.PI * 2)
  ctx.fill()
  drawStarShape(ctx, 0, -34, 11, '#e63946')
  drawStarShape(ctx, 0, -34, 6, '#ffd166')
  ctx.restore()
  ctx.restore()
}

function drawObstacle(ctx: CanvasRenderingContext2D, s: RunnerState, o: Obstacle) {
  const x = o.x - s.scrollX
  if (o.kind === 'rock') {
    ctx.fillStyle = '#4a4560'
    ctx.beginPath()
    ctx.moveTo(x, o.y + o.h)
    ctx.lineTo(x + o.w * 0.15, o.y + o.h * 0.35)
    ctx.lineTo(x + o.w * 0.5, o.y)
    ctx.lineTo(x + o.w * 0.85, o.y + o.h * 0.3)
    ctx.lineTo(x + o.w, o.y + o.h)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(x + o.w * 0.3, o.y + o.h * 0.3, o.w * 0.2, o.h * 0.2)
  } else if (o.kind === 'fence') {
    ctx.fillStyle = '#6b4a2b'
    ctx.fillRect(x + 2, o.y, 4, o.h)
    ctx.fillRect(x + o.w - 6, o.y, 4, o.h)
    ctx.fillRect(x, o.y + 10, o.w, 4)
    ctx.fillRect(x, o.y + 28, o.w, 4)
  } else {
    const r = o.h / 2
    const cx = x + o.w / 2
    const cy = o.y + r
    ctx.fillStyle = 'rgba(40,44,70,0.95)'
    ctx.beginPath()
    ctx.arc(cx - r * 1.1, cy + r * 0.2, r * 0.8, 0, Math.PI * 2)
    ctx.arc(cx, cy - r * 0.2, r, 0, Math.PI * 2)
    ctx.arc(cx + r * 1.1, cy + r * 0.2, r * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#c3c7ee'
    ctx.beginPath()
    ctx.arc(cx - 5, cy, 2, 0, Math.PI * 2)
    ctx.arc(cx + 5, cy, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPickup(ctx: CanvasRenderingContext2D, s: RunnerState, k: Pickup) {
  if (k.taken) return
  const x = k.x - s.scrollX
  const y = k.y + Math.sin(s.elapsed * 3 + k.phase) * 4
  if (k.kind === 'star') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 22)
    g.addColorStop(0, 'rgba(255,209,102,0.45)')
    g.addColorStop(1, 'rgba(255,209,102,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.fill()
    drawStarShape(ctx, x, y, k.r, '#ffd166')
  } else {
    ctx.fillStyle = '#c8862a'
    ctx.beginPath()
    ctx.arc(x, y, k.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, k.r * 0.6, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * k.r * 0.6, y + Math.sin(a) * k.r * 0.6)
      ctx.lineTo(x + Math.cos(a) * k.r, y + Math.sin(a) * k.r)
      ctx.stroke()
    }
  }
}

export function render(ctx: CanvasRenderingContext2D, s: RunnerState, reduced = false) {
  const { w, h } = s
  const gy = groundY(s)
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#0b1026')
  bg.addColorStop(1, '#1f2a5c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < STARS.length; i++) {
    const st = STARS[i]
    const a = reduced ? 0.7 : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.elapsed * 2 + st.phase))
    ctx.fillStyle = `rgba(255,244,214,${a})`
    ctx.beginPath()
    ctx.arc((((st.x * w - s.scrollX * 0.02) % w) + w) % w, st.y * h, st.r, 0, Math.PI * 2)
    ctx.fill()
  }

  const mx = w * 0.8
  const my = h * 0.18
  const mr = Math.min(w, h) * 0.09
  const glow = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 3)
  glow.addColorStop(0, 'rgba(255,209,102,0.4)')
  glow.addColorStop(1, 'rgba(255,209,102,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  const moon = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr)
  moon.addColorStop(0, '#fffbe9')
  moon.addColorStop(0.6, '#ffe9a8')
  moon.addColorStop(1, '#e0a52a')
  ctx.fillStyle = moon
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, Math.PI * 2)
  ctx.fill()

  drawHills(ctx, s, s.scrollX * 0.15, gy - 40, 28, 0.006, '#141b3d')
  drawHills(ctx, s, s.scrollX * 0.45, gy - 10, 40, 0.011, '#0d1330')

  // ground
  ctx.fillStyle = '#070a1a'
  ctx.fillRect(0, gy, w, h - gy)
  ctx.strokeStyle = 'rgba(126,214,165,0.35)'
  ctx.lineWidth = 2
  const off = s.scrollX % 40
  for (let x = -off; x < w; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, gy)
    ctx.lineTo(x + 6, gy - 6)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255,209,102,0.25)'
  ctx.fillRect(0, gy, w, 2)

  for (const k of s.pickups) drawPickup(ctx, s, k)
  for (const o of s.obstacles) drawObstacle(ctx, s, o)
  drawPlayer(ctx, s, reduced)

  for (const p of s.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif'
  ctx.textAlign = 'center'
  for (const p of s.popups) {
    ctx.globalAlpha = Math.min(1, p.life / 0.4)
    ctx.fillStyle = p.color
    ctx.fillText(p.text, p.x, p.y)
  }
  ctx.globalAlpha = 1

  if (s.hitFlash > 0) {
    ctx.fillStyle = `rgba(230,57,70,${s.hitFlash})`
    ctx.fillRect(0, 0, w, h)
  }
}
