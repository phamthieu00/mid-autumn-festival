import { generateImpulseData } from './impulse'

export interface Disposable {
  dispose(): void
}

function safeStop(node: AudioScheduledSourceNode) {
  try {
    node.stop()
  } catch {
    /* already stopped */
  }
}

export function createMasterChain(
  ctx: BaseAudioContext,
  volume: number,
): { bus: GainNode; master: GainNode } & Disposable {
  const bus = ctx.createGain()
  const master = ctx.createGain()
  master.gain.value = 0
  void volume

  const dry = ctx.createGain()
  dry.gain.value = 0.65
  bus.connect(dry).connect(master)

  const convolver = ctx.createConvolver()
  const ir = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 3), ctx.sampleRate)
  const [l, r] = generateImpulseData(ctx.sampleRate, 3, 2.4)
  ir.getChannelData(0).set(l)
  ir.getChannelData(1).set(r)
  convolver.buffer = ir
  const wet = ctx.createGain()
  wet.gain.value = 0.35
  bus.connect(convolver).connect(wet).connect(master)

  const delay = ctx.createDelay(1)
  delay.delayTime.value = 0.38
  const feedback = ctx.createGain()
  feedback.gain.value = 0.35
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2500
  const delayWet = ctx.createGain()
  delayWet.gain.value = 0.2
  bus.connect(delay).connect(feedback).connect(lp).connect(delay)
  lp.connect(delayWet).connect(master)

  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.knee.value = 12
  comp.ratio.value = 6
  comp.attack.value = 0.01
  comp.release.value = 0.3
  master.connect(comp).connect(ctx.destination)

  return {
    bus,
    master,
    dispose() {
      for (const n of [bus, dry, convolver, wet, delay, feedback, lp, delayWet, master, comp]) {
        try {
          n.disconnect()
        } catch {
          /* ignore */
        }
      }
    },
  }
}

export function createPad(
  ctx: BaseAudioContext,
  out: AudioNode,
): { setChord(freqs: number[], at: number): void } & Disposable {
  const gain = ctx.createGain()
  gain.gain.value = 0.18
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600
  filter.Q.value = 0.7
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.05
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 150
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()

  const types: OscillatorType[] = ['sine', 'triangle', 'sine']
  const detunes = [-6, 0, 6]
  const oscs = types.map((type, i) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.detune.value = detunes[i]
    const g = ctx.createGain()
    g.gain.value = i === 1 ? 0.5 : 0.8
    osc.connect(g).connect(filter)
    osc.start()
    return osc
  })
  filter.connect(gain).connect(out)

  return {
    setChord(freqs, at) {
      oscs.forEach((osc, i) => {
        const f = freqs[i] ?? freqs[0]
        osc.frequency.setTargetAtTime(f, at, 1.5)
      })
    },
    dispose() {
      oscs.forEach(safeStop)
      safeStop(lfo)
      for (const n of [...oscs, lfo, lfoGain, filter, gain]) {
        try {
          n.disconnect()
        } catch {
          /* ignore */
        }
      }
    },
  }
}

export function createWind(ctx: BaseAudioContext, out: AudioNode): Disposable {
  const len = Math.floor(ctx.sampleRate * 2)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 400
  bp.Q.value = 0.6
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 200
  lfo.connect(lfoGain).connect(bp.frequency)
  const gain = ctx.createGain()
  gain.gain.value = 0.012
  src.connect(bp).connect(gain).connect(out)
  src.start()
  lfo.start()
  return {
    dispose() {
      safeStop(src)
      safeStop(lfo)
      for (const n of [src, bp, lfo, lfoGain, gain]) {
        try {
          n.disconnect()
        } catch {
          /* ignore */
        }
      }
    },
  }
}

/** Đàn-tranh-like pluck: triangle + detuned partner through a bandpass with a fast decay. */
export function playPluck(
  ctx: BaseAudioContext,
  out: AudioNode,
  freq: number,
  at: number,
  velocity: number,
) {
  const decay = 1.2 + velocity * 0.8
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, at)
  env.gain.exponentialRampToValueAtTime(0.22 * velocity, at + 0.006)
  env.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq * 2
  bp.Q.value = 3
  bp.connect(env).connect(out)

  const make = (detune: number, gainValue: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.detune.value = detune
    osc.frequency.setValueAtTime(freq * 1.005, at)
    osc.frequency.exponentialRampToValueAtTime(freq, at + 0.06)
    const g = ctx.createGain()
    g.gain.value = gainValue
    osc.connect(g).connect(bp)
    osc.start(at)
    osc.stop(at + decay + 0.1)
  }
  make(0, 1)
  make(4, 0.5)
}

/** Soft bell made of four sine partials. */
export function playBell(
  ctx: BaseAudioContext,
  out: AudioNode,
  freq: number,
  at: number,
  velocity: number,
) {
  const partials = [1, 2.0, 2.76, 5.4]
  const gains = [1, 0.5, 0.25, 0.12]
  const decays = [3, 2.2, 1.6, 1]
  partials.forEach((ratio, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, at)
    env.gain.exponentialRampToValueAtTime(0.12 * velocity * gains[i], at + 0.01)
    env.gain.exponentialRampToValueAtTime(0.0001, at + decays[i])
    osc.connect(env).connect(out)
    osc.start(at)
    osc.stop(at + decays[i] + 0.1)
  })
}
