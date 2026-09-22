import { APPROACH, MULT_STEPS, POINTS, WINDOW } from './constants'
import type { Chart, Lane, Note, RhythmState, Verdict } from './types'

export function createState(chart: Chart): RhythmState {
  return {
    chart,
    nextIdx: [0, 0, 0],
    score: 0,
    combo: 0,
    maxCombo: 0,
    counts: { perfect: 0, good: 0, miss: 0 },
    lastJudge: null,
    padFlash: [-1, -1, -1],
    finished: false,
  }
}

/** delta = tapTime - note.time (seconds). null = too far away to count as an attempt. */
export function judge(delta: number): Verdict | null {
  const d = Math.abs(delta)
  if (d <= WINDOW.perfect) return 'perfect'
  if (d <= WINDOW.good) return 'good'
  if (d <= WINDOW.miss) return 'miss'
  return null
}

export function multiplier(combo: number): number {
  for (const [threshold, mult] of MULT_STEPS) if (combo >= threshold) return mult
  return 1
}

export function laneNotes(chart: Chart, lane: Lane): Note[] {
  return chart.notes.filter((n) => n.lane === lane)
}

function applyVerdict(s: RhythmState, note: Note, verdict: Verdict, lane: Lane, at: number) {
  note.judged = verdict
  s.counts[verdict]++
  if (verdict === 'miss') {
    s.combo = 0
  } else {
    s.score += POINTS[verdict] * multiplier(s.combo)
    s.combo++
    s.maxCombo = Math.max(s.maxCombo, s.combo)
  }
  s.lastJudge = { verdict, lane, at }
}

/** Player tapped `lane` at `songTime`. Returns the verdict or null when no note was in range. */
export function applyHit(s: RhythmState, lane: Lane, songTime: number): Verdict | null {
  s.padFlash[lane] = songTime
  if (s.finished) return null
  const notes = laneNotes(s.chart, lane)
  const idx = s.nextIdx[lane]
  const note = notes[idx]
  if (!note) return null
  const verdict = judge(songTime - note.time)
  if (!verdict) return null
  applyVerdict(s, note, verdict, lane, songTime)
  s.nextIdx[lane] = idx + 1
  return verdict
}

/** Auto-miss notes that scrolled past the window; mark finished at the end of the song. */
export function advance(s: RhythmState, songTime: number): Verdict[] {
  const out: Verdict[] = []
  if (s.finished) return out
  for (let lane = 0 as Lane; lane < 3; lane = (lane + 1) as Lane) {
    const notes = laneNotes(s.chart, lane)
    while (s.nextIdx[lane] < notes.length && songTime - notes[s.nextIdx[lane]].time > WINDOW.good) {
      applyVerdict(s, notes[s.nextIdx[lane]], 'miss', lane, songTime)
      s.nextIdx[lane]++
      out.push('miss')
    }
  }
  if (songTime >= s.chart.duration) s.finished = true
  return out
}

export const noteY = (note: Note, songTime: number, hitY: number) =>
  hitY - (note.time - songTime) * (hitY / APPROACH)
