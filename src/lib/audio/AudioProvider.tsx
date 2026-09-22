import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { safeGet, safeSet } from '@/lib/storage'
import { AmbientEngine } from './ambientEngine'
import { probeBgmFile } from './bgmProbe'

export type SfxName =
  | 'catch'
  | 'golden'
  | 'miss'
  | 'flip'
  | 'match'
  | 'correct'
  | 'wrong'
  | 'win'
  | 'pop'
  | 'drumLow'
  | 'drumHigh'
  | 'cymbal'
  | 'jump'

export interface AudioContextValue {
  musicOn: boolean
  musicAvailable: boolean
  sfxOn: boolean
  toggleMusic: () => void
  toggleSfx: () => void
  playSfx: (name: SfxName) => void
  /** Schedule a sound at an absolute AudioContext time (seconds). */
  scheduleSfx: (name: SfxName, when: number) => void
  /** AudioContext clock in seconds (falls back to performance.now()). */
  getTime: () => number
}

// eslint-disable-next-line react-refresh/only-export-components
export const AudioCtx = createContext<AudioContextValue | null>(null)

const BGM_SRC = '/audio/bgm.mp3'

type Note = {
  f: number
  t: number
  d: number
  type?: OscillatorType
  g?: number
  /** glide target frequency reached at the end of the note */
  f2?: number
  /** use filtered white noise instead of an oscillator (f = highpass cutoff) */
  noise?: boolean
}

const SFX: Record<SfxName, Note[]> = {
  catch: [
    { f: 880, t: 0, d: 0.08 },
    { f: 1320, t: 0.06, d: 0.12 },
  ],
  golden: [
    { f: 1046, t: 0, d: 0.1 },
    { f: 1318, t: 0.08, d: 0.1 },
    { f: 1568, t: 0.16, d: 0.1 },
    { f: 2093, t: 0.24, d: 0.2 },
  ],
  miss: [
    { f: 220, t: 0, d: 0.18, type: 'sawtooth', g: 0.12 },
    { f: 160, t: 0.12, d: 0.2, type: 'sawtooth', g: 0.1 },
  ],
  flip: [{ f: 600, t: 0, d: 0.06, type: 'triangle' }],
  match: [
    { f: 784, t: 0, d: 0.1 },
    { f: 988, t: 0.09, d: 0.16 },
  ],
  correct: [
    { f: 659, t: 0, d: 0.1 },
    { f: 880, t: 0.1, d: 0.2 },
  ],
  wrong: [
    { f: 300, t: 0, d: 0.15, type: 'square', g: 0.08 },
    { f: 240, t: 0.14, d: 0.22, type: 'square', g: 0.08 },
  ],
  win: [
    { f: 523, t: 0, d: 0.12 },
    { f: 659, t: 0.12, d: 0.12 },
    { f: 784, t: 0.24, d: 0.12 },
    { f: 1046, t: 0.36, d: 0.35 },
  ],
  pop: [
    { f: 440, t: 0, d: 0.05, type: 'triangle' },
    { f: 660, t: 0.04, d: 0.08, type: 'triangle' },
  ],
  drumLow: [{ f: 160, f2: 55, t: 0, d: 0.28, type: 'sine', g: 0.5 }],
  drumHigh: [
    { f: 420, f2: 180, t: 0, d: 0.12, type: 'triangle', g: 0.35 },
    { f: 3000, t: 0, d: 0.03, noise: true, g: 0.12 },
  ],
  cymbal: [{ f: 6000, t: 0, d: 0.35, noise: true, g: 0.22 }],
  jump: [{ f: 500, f2: 900, t: 0, d: 0.12, type: 'triangle', g: 0.14 }],
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [musicOn, setMusicOn] = useState<boolean>(() => safeGet('music', false))
  const [sfxOn, setSfxOn] = useState<boolean>(() => safeGet('sfx', true))
  const ctxRef = useRef<AudioContext | null>(null)
  const engineRef = useRef<AmbientEngine | null>(null)
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const bgmFileRef = useRef<boolean | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const musicOnRef = useRef(musicOn)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const startEngine = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    engineRef.current ??= new AmbientEngine({ volume: 0.25 })
    engineRef.current.start(ctx)
  }, [getCtx])

  const startMusic = useCallback(() => {
    if (bgmFileRef.current) {
      if (!bgmRef.current) {
        const el = new Audio(BGM_SRC)
        el.loop = true
        el.volume = 0.35
        el.addEventListener('error', () => {
          bgmFileRef.current = false
          if (musicOnRef.current) startEngine()
        })
        bgmRef.current = el
      }
      getCtx()
      bgmRef.current.play().catch(() => {
        /* waiting for a gesture */
      })
      return
    }
    startEngine()
  }, [getCtx, startEngine])

  const stopMusic = useCallback(() => {
    bgmRef.current?.pause()
    engineRef.current?.stop(1.5)
  }, [])

  // Probe the optional bgm file once; start music on the first gesture when it was on last session.
  useEffect(() => {
    let cancelled = false
    probeBgmFile(BGM_SRC).then((ok) => {
      if (!cancelled) bgmFileRef.current = ok
    })
    if (!musicOnRef.current) {
      return () => {
        cancelled = true
      }
    }
    const onGesture = () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
      if (musicOnRef.current) startMusic()
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [startMusic])

  // File playback pauses while hidden (the engine handles itself).
  useEffect(() => {
    const onVis = () => {
      const el = bgmRef.current
      if (!el) return
      if (document.hidden) el.pause()
      else if (musicOnRef.current) el.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    return () => {
      engineRef.current?.stop(0)
      bgmRef.current?.pause()
    }
  }, [])

  const toggleMusic = useCallback(() => {
    const next = !musicOnRef.current
    musicOnRef.current = next
    setMusicOn(next)
    safeSet('music', next)
    if (next) startMusic()
    else stopMusic()
  }, [startMusic, stopMusic])

  const toggleSfx = useCallback(() => {
    setSfxOn((prev) => {
      const next = !prev
      safeSet('sfx', next)
      return next
    })
  }, [])

  const getTime = useCallback(() => {
    return ctxRef.current ? ctxRef.current.currentTime : performance.now() / 1000
  }, [])

  const noiseBuffer = useCallback((ctx: AudioContext) => {
    if (!noiseRef.current) {
      const len = Math.floor(ctx.sampleRate * 0.5)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
      noiseRef.current = buf
    }
    return noiseRef.current
  }, [])

  const scheduleSfx = useCallback(
    (name: SfxName, when: number) => {
      if (!sfxOn) return
      const ctx = getCtx()
      if (!ctx) return
      const base = Math.max(when, ctx.currentTime)
      for (const n of SFX[name]) {
        const start = base + n.t
        const gain = ctx.createGain()
        const g = n.g ?? 0.18
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(g, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d)
        gain.connect(ctx.destination)
        if (n.noise) {
          const src = ctx.createBufferSource()
          src.buffer = noiseBuffer(ctx)
          const hp = ctx.createBiquadFilter()
          hp.type = 'highpass'
          hp.frequency.value = n.f
          src.connect(hp).connect(gain)
          src.start(start)
          src.stop(start + n.d + 0.02)
        } else {
          const osc = ctx.createOscillator()
          osc.type = n.type ?? 'sine'
          osc.frequency.setValueAtTime(n.f, start)
          if (n.f2) osc.frequency.exponentialRampToValueAtTime(n.f2, start + n.d)
          osc.connect(gain)
          osc.start(start)
          osc.stop(start + n.d + 0.02)
        }
      }
    },
    [sfxOn, getCtx, noiseBuffer],
  )

  const playSfx = useCallback(
    (name: SfxName) => scheduleSfx(name, getTime()),
    [scheduleSfx, getTime],
  )

  const value = useMemo<AudioContextValue>(
    () => ({
      musicOn,
      musicAvailable: true,
      sfxOn,
      toggleMusic,
      toggleSfx,
      playSfx,
      scheduleSfx,
      getTime,
    }),
    [musicOn, sfxOn, toggleMusic, toggleSfx, playSfx, scheduleSfx, getTime],
  )

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}
