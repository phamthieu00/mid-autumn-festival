import { seededRng } from '../../random'
import { BARS, BEAT, LEAD_IN, STEP } from './constants'
import type { Chart, Lane, Note } from './types'

type Pattern = readonly [string, string, string]

export const PATTERNS: Record<'easy' | 'medium' | 'hard', Pattern[]> = {
  easy: [
    ['x...x...x...x...', '................', '................'],
    ['x...x...x...x...', '..x.......x.....', '................'],
    ['x.......x.......', '....x.......x...', '................'],
    ['x...x...x...x...', '................', '............x...'],
  ],
  medium: [
    ['x...x...x.x.x...', '..x...x...x...x.', '................'],
    ['x.x.....x.x.....', '....x.......x...', '..............x.'],
    ['x...x...x...x...', '..x...x...x...x.', '............x...'],
    ['x.......x.......', 'x.x.x...x.x.x...', '....x.......x...'],
  ],
  hard: [
    ['x.x.x.x.x.x.x.x.', '..x...x.....x.x.', 'x.......x.......'],
    ['x...x...x...x...', 'x.x.x.x.x.x.x.x.', '..x...x...x...x.'],
    ['x.x.....x.x.....', '....x.x.....x.x.', 'x.......x.......'],
    ['x...x.x.x...x.x.', '..x.....x.x.....', '......x.......x.'],
  ],
}

export const levelForBar = (bar: number): keyof typeof PATTERNS =>
  bar < 6 ? 'easy' : bar < 16 ? 'medium' : 'hard'

export function generateChart(seed: number): Chart {
  const rng = seededRng(seed)
  const notes: Note[] = []
  let id = 1
  for (let bar = 0; bar < BARS; bar++) {
    const set = PATTERNS[levelForBar(bar)]
    const pattern = set[Math.floor(rng() * set.length)]
    for (let step = 0; step < 16; step++) {
      const lanes: Lane[] = []
      for (let lane = 0; lane < 3; lane++) if (pattern[lane][step] === 'x') lanes.push(lane as Lane)
      // cymbal accent at the start of every 4th bar when there is room
      if (step === 0 && bar % 4 === 3 && !lanes.includes(2) && lanes.length < 2) lanes.push(2)
      for (const lane of lanes.slice(0, 2)) {
        notes.push({ id: id++, time: LEAD_IN + (bar * 16 + step) * STEP, lane })
      }
    }
  }
  notes.sort((a, b) => a.time - b.time || a.lane - b.lane)
  notes.forEach((n, i) => (n.id = i + 1))
  const duration = LEAD_IN + BARS * 4 * BEAT + 1.5
  return { seed, notes, duration }
}
