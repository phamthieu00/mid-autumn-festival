import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { safeGet, safeSet } from '@/lib/storage'

export type SfxName = 'catch' | 'golden' | 'miss' | 'flip' | 'match' | 'correct' | 'wrong' | 'win' | 'pop'

export interface AudioContextValue {
  musicOn: boolean
  musicAvailable: boolean
  sfxOn: boolean
  toggleMusic: () => void
  toggleSfx: () => void
  playSfx: (name: SfxName) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AudioCtx = createContext<AudioContextValue | null>(null)

const BGM_SRC = '/audio/bgm.mp3'

type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number }

const SFX: Record<SfxName, Note[]> = {
  catch: [{ f: 880, t: 0, d: 0.08 }, { f: 1320, t: 0.06, d: 0.12 }],
  golden: [
    { f: 1046, t: 0, d: 0.1 },
    { f: 1318, t: 0.08, d: 0.1 },
    { f: 1568, t: 0.16, d: 0.1 },
    { f: 2093, t: 0.24, d: 0.2 },
  ],
  miss: [{ f: 220, t: 0, d: 0.18, type: 'sawtooth', g: 0.12 }, { f: 160, t: 0.12, d: 0.2, type: 'sawtooth', g: 0.1 }],
  flip: [{ f: 600, t: 0, d: 0.06, type: 'triangle' }],
  match: [{ f: 784, t: 0, d: 0.1 }, { f: 988, t: 0.09, d: 0.16 }],
  correct: [{ f: 659, t: 0, d: 0.1 }, { f: 880, t: 0.1, d: 0.2 }],
  wrong: [{ f: 300, t: 0, d: 0.15, type: 'square', g: 0.08 }, { f: 240, t: 0.14, d: 0.22, type: 'square', g: 0.08 }],
  win: [
    { f: 523, t: 0, d: 0.12 },
    { f: 659, t: 0.12, d: 0.12 },
    { f: 784, t: 0.24, d: 0.12 },
    { f: 1046, t: 0.36, d: 0.35 },
  ],
  pop: [{ f: 440, t: 0, d: 0.05, type: 'triangle' }, { f: 660, t: 0.04, d: 0.08, type: 'triangle' }],
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [musicOn, setMusicOn] = useState<boolean>(() => safeGet('music', false))
  const [sfxOn, setSfxOn] = useState<boolean>(() => safeGet('sfx', true))
  const [musicAvailable, setMusicAvailable] = useState(true)
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const getBgm = useCallback(() => {
    if (!bgmRef.current) {
      const el = new Audio(BGM_SRC)
      el.loop = true
      el.volume = 0.35
      el.preload = 'none'
      el.addEventListener('error', () => {
        setMusicAvailable(false)
        setMusicOn(false)
      })
      bgmRef.current = el
    }
    return bgmRef.current
  }, [])

  // Resume music after a user gesture if it was on last session.
  useEffect(() => {
    if (!musicOn) {
      bgmRef.current?.pause()
      return
    }
    const el = getBgm()
    const tryPlay = () => {
      el.play().catch(() => {
        /* waiting for gesture */
      })
    }
    tryPlay()
    const onGesture = () => {
      tryPlay()
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [musicOn, getBgm])

  useEffect(() => {
    const onVis = () => {
      if (!bgmRef.current) return
      if (document.hidden) bgmRef.current.pause()
      else if (musicOn) bgmRef.current.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [musicOn])

  const toggleMusic = useCallback(() => {
    setMusicOn((prev) => {
      const next = !prev
      safeSet('music', next)
      return next
    })
  }, [])

  const toggleSfx = useCallback(() => {
    setSfxOn((prev) => {
      const next = !prev
      safeSet('sfx', next)
      return next
    })
  }, [])

  const playSfx = useCallback(
    (name: SfxName) => {
      if (!sfxOn) return
      const ctx = getCtx()
      if (!ctx) return
      const now = ctx.currentTime
      for (const n of SFX[name]) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = n.type ?? 'sine'
        osc.frequency.setValueAtTime(n.f, now + n.t)
        const g = n.g ?? 0.18
        gain.gain.setValueAtTime(0.0001, now + n.t)
        gain.gain.exponentialRampToValueAtTime(g, now + n.t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d)
        osc.connect(gain).connect(ctx.destination)
        osc.start(now + n.t)
        osc.stop(now + n.t + n.d + 0.02)
      }
    },
    [sfxOn, getCtx],
  )

  const value = useMemo(
    () => ({ musicOn, musicAvailable, sfxOn, toggleMusic, toggleSfx, playSfx }),
    [musicOn, musicAvailable, sfxOn, toggleMusic, toggleSfx, playSfx],
  )

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}
