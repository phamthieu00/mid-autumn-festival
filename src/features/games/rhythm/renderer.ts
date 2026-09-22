import { APPROACH, HIT_LINE_RATIO, LANE_COLORS, WINDOW } from './constants'
import { noteY } from './engine'
import type { RhythmState } from './types'

export interface RenderLabels {
  perfect: string
  good: string
  miss: string
}

export function render(
  ctx: CanvasRenderingContext2D,
  s: RhythmState,
  songTime: number,
  w: number,
  h: number,
  labels: RenderLabels,
) {
  ctx.clearRect(0, 0, w, h)
  const laneW = w / 3
  const hitY = h * HIT_LINE_RATIO

  // lanes
  for (let lane = 0; lane < 3; lane++) {
    const x = lane * laneW
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(1, `${LANE_COLORS[lane]}22`)
    ctx.fillStyle = g
    ctx.fillRect(x, 0, laneW, h)
    if (lane > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    // pad flash
    const since = songTime - s.padFlash[lane]
    if (since >= 0 && since < 0.15) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 * (1 - since / 0.15)})`
      ctx.fillRect(x, hitY - 40, laneW, 80)
    }
  }

  // hit line
  ctx.shadowColor = 'rgba(255,209,102,0.8)'
  ctx.shadowBlur = 14
  ctx.strokeStyle = '#ffd166'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, hitY)
  ctx.lineTo(w, hitY)
  ctx.stroke()
  ctx.shadowBlur = 0

  // notes
  const r = Math.min(laneW * 0.22, 26)
  for (const n of s.chart.notes) {
    if (n.judged && n.judged !== 'miss') continue
    const dt = n.time - songTime
    if (dt > APPROACH || dt < -0.25) continue
    const y = noteY(n, songTime, hitY)
    const cx = n.lane * laneW + laneW / 2
    const inWindow = Math.abs(dt) <= WINDOW.good
    const color = LANE_COLORS[n.lane]
    if (n.judged === 'miss') ctx.globalAlpha = 0.35
    const g = ctx.createRadialGradient(cx - r * 0.3, y - r * 0.3, r * 0.1, cx, y, r)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.35, color)
    g.addColorStop(1, color)
    ctx.fillStyle = g
    ctx.shadowColor = color
    ctx.shadowBlur = inWindow ? 22 : 8
    ctx.beginPath()
    ctx.ellipse(cx, y, r, r * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }

  // judgement text
  if (s.lastJudge) {
    const age = songTime - s.lastJudge.at
    if (age >= 0 && age < 0.5) {
      const cx = s.lastJudge.lane * laneW + laneW / 2
      ctx.globalAlpha = 1 - age / 0.5
      ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle =
        s.lastJudge.verdict === 'perfect'
          ? '#ffd166'
          : s.lastJudge.verdict === 'good'
            ? '#7ed6a5'
            : '#ff8c8c'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 6
      ctx.fillText(labels[s.lastJudge.verdict], cx, hitY - 60 - age * 40)
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }
  }

  // progress
  const p = Math.max(0, Math.min(1, songTime / s.chart.duration))
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fillRect(0, 0, w, 4)
  ctx.fillStyle = '#ffd166'
  ctx.fillRect(0, 0, w * p, 4)
}
