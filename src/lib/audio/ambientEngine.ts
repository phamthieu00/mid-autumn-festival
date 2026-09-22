import { seededRng } from '@/lib/random'
import { PhraseGenerator, type NoteEvent } from './ambient/phrase'
import { CHORDS, chordFreqs, degreeToFreq } from './ambient/scale'
import { createMasterChain, createPad, createWind, playBell, playPluck } from './ambient/voices'

export interface AmbientEngineOptions {
  volume?: number
  seed?: number
  lookaheadSec?: number
  tickMs?: number
}

const CHORD_MIN = 14
const CHORD_MAX = 22

/**
 * Generative ambient music: slow pentatonic plucks over a morphing pad,
 * scheduled ahead of time on the AudioContext clock.
 */
export class AmbientEngine {
  private ctx: AudioContext | null = null
  private chain: ReturnType<typeof createMasterChain> | null = null
  private pad: ReturnType<typeof createPad> | null = null
  private wind: ReturnType<typeof createWind> | null = null
  private readonly gen: PhraseGenerator
  private readonly rng: () => number
  private timer: ReturnType<typeof setInterval> | null = null
  private fadeTimer: ReturnType<typeof setTimeout> | null = null
  private nextTime = 0
  private chordIdx = 0
  private nextChordAt = 0
  private volume: number
  private running = false
  private readonly lookahead: number
  private readonly tickMs: number

  constructor(opts: AmbientEngineOptions = {}) {
    this.volume = opts.volume ?? 0.25
    this.lookahead = opts.lookaheadSec ?? 0.3
    this.tickMs = opts.tickMs ?? 100
    this.rng = opts.seed != null ? seededRng(opts.seed) : Math.random
    this.gen = new PhraseGenerator(this.rng)
  }

  get isRunning() {
    return this.running
  }

  start(ctx: AudioContext) {
    if (this.running && this.ctx === ctx) return
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer)
      this.fadeTimer = null
    }
    if (this.ctx !== ctx) {
      this.disposeGraph()
      this.ctx = ctx
    }
    if (!this.chain) this.buildGraph()
    const now = ctx.currentTime
    const master = this.chain!.master
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now)
    master.gain.linearRampToValueAtTime(this.volume, now + 2)
    this.nextTime = now + 0.2
    this.nextChordAt = now + CHORD_MIN + this.rng() * (CHORD_MAX - CHORD_MIN)
    this.running = true
    this.startTimer()
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  stop(fadeSec = 1.5) {
    if (!this.running) return
    this.running = false
    this.stopTimer()
    document.removeEventListener('visibilitychange', this.onVisibility)
    const ctx = this.ctx
    if (ctx && this.chain) {
      const now = ctx.currentTime
      const g = this.chain.master.gain
      g.cancelScheduledValues(now)
      g.setValueAtTime(Math.max(0.0001, g.value || this.volume), now)
      g.linearRampToValueAtTime(0.0001, now + Math.max(0.01, fadeSec))
    }
    this.fadeTimer = setTimeout(
      () => {
        this.fadeTimer = null
        if (!this.running) this.disposeGraph()
      },
      Math.max(0, fadeSec * 1000) + 50,
    )
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.ctx && this.chain && this.running) {
      this.chain.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.2)
    }
  }

  private startTimer() {
    this.stopTimer()
    this.timer = setInterval(this.tick, this.tickMs)
    this.tick()
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  private readonly tick = () => {
    const ctx = this.ctx
    if (!ctx || !this.running) return
    const now = ctx.currentTime
    if (this.nextTime < now - 1) this.nextTime = now + 0.05
    const horizon = now + this.lookahead
    let guard = 0
    while (this.nextTime < horizon && guard++ < 32) {
      const ev = this.gen.next()
      this.nextTime += ev.offset
      if (ev.kind !== 'rest') this.schedule(ev, this.nextTime)
    }
    this.maybeMorphChord(now)
  }

  private schedule(ev: NoteEvent, at: number) {
    const ctx = this.ctx
    if (!ctx || !this.chain) return
    if (ev.kind === 'pluck')
      playPluck(ctx, this.chain.bus, degreeToFreq(ev.degree), at, ev.velocity)
    else if (ev.kind === 'bell')
      playBell(ctx, this.chain.bus, degreeToFreq(ev.degree, 2), at, ev.velocity)
  }

  private maybeMorphChord(now: number) {
    if (now < this.nextChordAt || !this.pad) return
    let next = this.chordIdx
    while (next === this.chordIdx) next = Math.floor(this.rng() * CHORDS.length)
    this.chordIdx = next
    this.gen.setChord(next)
    this.pad.setChord(chordFreqs(next), now + 0.1)
    this.nextChordAt = now + CHORD_MIN + this.rng() * (CHORD_MAX - CHORD_MIN)
  }

  private readonly onVisibility = () => {
    const ctx = this.ctx
    if (!ctx || !this.chain || !this.running) return
    if (document.hidden) {
      this.stopTimer()
      this.chain.master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1)
    } else {
      const state = ctx.state as string
      if (state === 'suspended' || state === 'interrupted') void ctx.resume()
      this.nextTime = ctx.currentTime + 0.1
      this.chain.master.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.5)
      this.startTimer()
    }
  }

  private buildGraph() {
    const ctx = this.ctx
    if (!ctx) return
    this.chain = createMasterChain(ctx, this.volume)
    this.pad = createPad(ctx, this.chain.bus)
    this.pad.setChord(chordFreqs(this.chordIdx), ctx.currentTime)
    this.wind = createWind(ctx, this.chain.bus)
  }

  private disposeGraph() {
    this.pad?.dispose()
    this.wind?.dispose()
    this.chain?.dispose()
    this.pad = null
    this.wind = null
    this.chain = null
  }
}
