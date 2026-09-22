import type { EngineState, Entity } from './types'

function drawLantern(ctx: CanvasRenderingContext2D, e: Entity) {
  const golden = e.kind === 'golden'
  const body = golden ? '#f4c15d' : `hsl(${e.hue}, 85%, 55%)`
  const light = golden ? '#fff1b8' : `hsl(${e.hue}, 95%, 78%)`
  const glow = golden ? 'rgba(255,209,102,0.55)' : `hsla(${e.hue}, 90%, 60%, 0.5)`
  const r = e.r
  const sway = Math.sin(e.age * 2 + e.phase) * 0.08

  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.rotate(sway)

  // glow
  const g = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2)
  g.addColorStop(0, glow)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, r * 2, 0, Math.PI * 2)
  ctx.fill()

  // string
  ctx.strokeStyle = '#f4c15d'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.55)
  ctx.lineTo(0, -r * 1.2)
  ctx.stroke()

  // caps
  ctx.fillStyle = '#b8860b'
  ctx.fillRect(-r * 0.45, -r * 1.3, r * 0.9, r * 0.22)
  ctx.fillRect(-r * 0.45, r * 1.08, r * 0.9, r * 0.22)

  // body
  const bg = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r * 1.2)
  bg.addColorStop(0, light)
  bg.addColorStop(0.6, body)
  bg.addColorStop(1, body)
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.ellipse(0, 0, r, r * 1.15, 0, 0, Math.PI * 2)
  ctx.fill()

  // ribs
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'
  ctx.lineWidth = 1.2
  for (const k of [-0.5, 0, 0.5]) {
    ctx.beginPath()
    ctx.ellipse(k * r * 0.7, 0, r * 0.28, r * 1.12, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // tassels
  ctx.strokeStyle = '#f4c15d'
  ctx.lineWidth = 1.5
  for (const k of [-0.25, 0, 0.25]) {
    ctx.beginPath()
    ctx.moveTo(k * r, r * 1.3)
    ctx.lineTo(k * r * 1.3, r * 1.75)
    ctx.stroke()
  }

  if (golden) {
    ctx.fillStyle = '#fff8dc'
    const t = e.age * 6
    for (let i = 0; i < 3; i++) {
      const a = t + (i * Math.PI * 2) / 3
      const sx = Math.cos(a) * r * 1.4
      const sy = Math.sin(a) * r * 1.5
      ctx.beginPath()
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawCloud(ctx: CanvasRenderingContext2D, e: Entity) {
  const r = e.r
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.fillStyle = 'rgba(40, 44, 70, 0.95)'
  ctx.strokeStyle = 'rgba(120, 125, 170, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(-r * 0.5, r * 0.1, r * 0.5, 0, Math.PI * 2)
  ctx.arc(-r * 0.05, -r * 0.25, r * 0.6, 0, Math.PI * 2)
  ctx.arc(r * 0.5, r * 0.1, r * 0.5, 0, Math.PI * 2)
  ctx.arc(0, r * 0.3, r * 0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // grumpy face
  ctx.fillStyle = '#c3c7ee'
  ctx.beginPath()
  ctx.arc(-r * 0.22, 0, 2.5, 0, Math.PI * 2)
  ctx.arc(r * 0.22, 0, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#c3c7ee'
  ctx.beginPath()
  ctx.arc(0, r * 0.35, r * 0.2, Math.PI * 1.15, Math.PI * 1.85)
  ctx.stroke()
  ctx.restore()
}

export function render(ctx: CanvasRenderingContext2D, state: EngineState) {
  ctx.clearRect(0, 0, state.w, state.h)

  for (const e of state.entities) {
    if (e.kind === 'cloud') drawCloud(ctx, e)
    else drawLantern(ctx, e)
  }

  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif'
  ctx.textAlign = 'center'
  for (const p of state.popups) {
    ctx.globalAlpha = Math.min(1, p.life / 0.4)
    ctx.fillStyle = p.color
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 6
    ctx.fillText(p.text, p.x, p.y)
  }
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
}
