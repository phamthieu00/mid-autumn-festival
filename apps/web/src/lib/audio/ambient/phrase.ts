import { isChordTone, SCALE_SIZE } from './scale'

export type NoteEvent =
  | { kind: 'pluck'; offset: number; degree: number; velocity: number }
  | { kind: 'bell'; offset: number; degree: number; velocity: number }
  | { kind: 'rest'; offset: number }

/** Inter-onset intervals in seconds (free time around 60 BPM). */
export const IOI = [0.5, 0.75, 1, 1.5, 2] as const
const IOI_WEIGHTS = [0.1, 0.15, 0.3, 0.25, 0.2]
const STEPS: readonly [number, number][] = [
  [0, 0.1],
  [1, 0.2],
  [-1, 0.2],
  [2, 0.15],
  [-2, 0.15],
  [3, 0.05],
  [-3, 0.05],
  [4, 0.05],
  [-4, 0.05],
]
/** Melodic range in scale degrees: 0..RANGE-1 = D4..B5 */
export const RANGE = 2 * SCALE_SIZE
export const PHRASE_MIN = 3
export const PHRASE_MAX = 6
export const REST_MIN = 2
export const REST_MAX = 5
export const BELL_CHANCE = 0.15

function weighted<T>(items: readonly T[], weights: readonly number[], rng: () => number): T {
  let r = rng() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

export class PhraseGenerator {
  private mode: 'rest' | 'phrase' | 'ending' | 'afterBell' = 'rest'
  private remaining = 0
  private last = 2
  private chord = 0
  private rng: () => number

  constructor(rng: () => number = Math.random) {
    this.rng = rng
  }

  setChord(idx: number) {
    this.chord = idx
  }

  get chordIndex() {
    return this.chord
  }

  private chordTones(): number[] {
    const out: number[] = []
    for (let d = 0; d < RANGE; d++) if (isChordTone(d, this.chord)) out.push(d)
    return out
  }

  private nearestChordTone(degree: number): number {
    const tones = this.chordTones()
    let best = tones[0]
    for (const t of tones) if (Math.abs(t - degree) < Math.abs(best - degree)) best = t
    return best
  }

  private ioi(): number {
    return weighted(IOI, IOI_WEIGHTS, this.rng)
  }

  next(): NoteEvent {
    const rng = this.rng
    if (this.mode === 'rest') {
      this.remaining = PHRASE_MIN + Math.floor(rng() * (PHRASE_MAX - PHRASE_MIN + 1))
      this.mode = 'phrase'
      const tones = this.chordTones()
      const degree =
        rng() < 0.7 ? tones[Math.floor(rng() * tones.length)] : Math.floor(rng() * RANGE)
      this.last = degree
      this.remaining -= 1
      return { kind: 'pluck', offset: this.ioi(), degree, velocity: 0.4 + rng() * 0.4 }
    }
    if (this.mode === 'phrase') {
      const isLast = this.remaining === 1
      let degree: number
      if (isLast) {
        degree = this.nearestChordTone(this.last)
      } else {
        const step = weighted(
          STEPS.map((s) => s[0]),
          STEPS.map((s) => s[1]),
          rng,
        )
        degree = this.last + step
        if (degree < 0 || degree >= RANGE) degree = this.last - step
        degree = Math.min(RANGE - 1, Math.max(0, degree))
      }
      this.last = degree
      this.remaining -= 1
      if (this.remaining === 0) this.mode = 'ending'
      const velocity = (0.4 + rng() * 0.4) * (isLast ? 0.85 : 1)
      return { kind: 'pluck', offset: this.ioi() * (isLast ? 1.5 : 1), degree, velocity }
    }
    if (this.mode === 'ending' && rng() < BELL_CHANCE) {
      // a soft bell on D6 or A6, then the rest follows on the next call
      this.mode = 'afterBell'
      const degree = rng() < 0.5 ? 0 : 3
      return { kind: 'bell', offset: 0.75, degree, velocity: 0.3 }
    }
    this.mode = 'rest'
    return { kind: 'rest', offset: REST_MIN + rng() * (REST_MAX - REST_MIN) }
  }
}
