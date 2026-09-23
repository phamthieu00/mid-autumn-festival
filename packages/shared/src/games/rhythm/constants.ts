export const LANES = 3
export const LANE_KEYS = ['d', 'f', 'j'] as const
export const BPM = 120
export const BEAT = 60 / BPM
export const STEP = BEAT / 4
export const BARS = 24
export const LEAD_IN = 2
export const SONG_LENGTH = LEAD_IN + BARS * 4 * BEAT + 1.5
export const APPROACH = 1.4
export const HIT_LINE_RATIO = 0.82
export const WINDOW = { perfect: 0.05, good: 0.11, miss: 0.16 } as const
export const POINTS = { perfect: 100, good: 60 } as const
export const MULT_STEPS: readonly [number, number][] = [
  [50, 4],
  [25, 3],
  [10, 2],
]
export const SCHEDULE_AHEAD = 0.25
export const LANE_COLORS = ['#e63946', '#f4c15d', '#7ed6a5'] as const
