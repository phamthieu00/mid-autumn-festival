import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AmbientEngine } from './ambientEngine'

function param(value = 0) {
  return {
    value,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  }
}

function makeCtx() {
  const start = Date.now()
  const created = { osc: 0, convolver: 0 }
  const stopped: number[] = []
  const node = () => ({
    connect(dest: unknown) {
      return dest
    },
    disconnect: vi.fn(),
  })
  const ctx = {
    sampleRate: 8000,
    state: 'running',
    destination: node(),
    resume: vi.fn(),
    get currentTime() {
      return (Date.now() - start) / 1000
    },
    createGain: () => ({ ...node(), gain: param(1) }),
    createOscillator: () => {
      created.osc++
      return {
        ...node(),
        type: 'sine',
        frequency: param(440),
        detune: param(0),
        start: vi.fn(),
        stop: vi.fn(() => stopped.push(1)),
      }
    },
    createBiquadFilter: () => ({ ...node(), type: 'lowpass', frequency: param(), Q: param() }),
    createConvolver: () => {
      created.convolver++
      return { ...node(), buffer: null }
    },
    createDelay: () => ({ ...node(), delayTime: param() }),
    createDynamicsCompressor: () => ({
      ...node(),
      threshold: param(),
      knee: param(),
      ratio: param(),
      attack: param(),
      release: param(),
    }),
    createBuffer: (_ch: number, len: number) => ({
      length: len,
      getChannelData: () => new Float32Array(len),
    }),
    createBufferSource: () => ({
      ...node(),
      buffer: null,
      loop: false,
      start: vi.fn(),
      stop: vi.fn(),
    }),
  }
  return { ctx: ctx as unknown as AudioContext, created, stopped }
}

describe('AmbientEngine', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts, schedules plucks over time and stops with a fade', () => {
    const { ctx, created } = makeCtx()
    const engine = new AmbientEngine({ seed: 5, tickMs: 100 })
    engine.start(ctx)
    expect(engine.isRunning).toBe(true)
    const padOscs = created.osc // 3 pad + 1 lfo + 1 wind lfo
    vi.advanceTimersByTime(6000)
    expect(created.osc).toBeGreaterThan(padOscs)

    engine.stop(1)
    expect(engine.isRunning).toBe(false)
    const before = created.osc
    vi.advanceTimersByTime(2000)
    expect(created.osc).toBe(before) // no more scheduling after stop
  })

  it('does not duplicate the graph when started twice', () => {
    const { ctx, created } = makeCtx()
    const engine = new AmbientEngine({ seed: 1 })
    engine.start(ctx)
    engine.start(ctx)
    expect(created.convolver).toBe(1)
    engine.stop(0)
    vi.advanceTimersByTime(200)
    engine.start(ctx)
    expect(created.convolver).toBe(2) // rebuilt after full stop
    engine.stop(0)
  })
})
