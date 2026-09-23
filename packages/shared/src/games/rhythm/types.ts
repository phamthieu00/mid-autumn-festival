export type Verdict = 'perfect' | 'good' | 'miss'
export type Lane = 0 | 1 | 2

export interface Note {
  id: number
  time: number
  lane: Lane
  judged?: Verdict
}

export interface Chart {
  seed: number
  notes: Note[]
  duration: number
}

export interface RhythmState {
  chart: Chart
  nextIdx: [number, number, number]
  score: number
  combo: number
  maxCombo: number
  counts: Record<Verdict, number>
  lastJudge: { verdict: Verdict; lane: Lane; at: number } | null
  padFlash: [number, number, number]
  finished: boolean
}
