import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Flame, Timer } from 'lucide-react'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { scoresStore } from '@/features/scores/scoresStore'
import { Badge } from '@/components/ui/Badge'
import { GameShell, type GameStatus } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { useGameLoop } from '../shared/useGameLoop'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { createState, tapAt, timeLeft, update } from './engine'
import { render } from './renderer'
import { COMBO_THRESHOLD } from './constants'
import type { EngineState } from './types'

const GAME = gameById('catch')

export default function CatchLanternsGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<EngineState>(createState(360, 560))
  const hudAcc = useRef(0)

  const [status, setStatus] = useState<GameStatus>('idle')
  const [hud, setHud] = useState({ score: 0, combo: 0, time: 60 })
  const [result, setResult] = useState<{ score: number; isRecord: boolean; prev?: number; maxCombo: number } | null>(null)

  // canvas sizing
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
      stateRef.current.w = rect.width
      stateRef.current.h = rect.height
      if (ctx) render(ctx, stateRef.current)
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const syncHud = useCallback(() => {
    const s = stateRef.current
    setHud({ score: s.score, combo: s.combo, time: Math.ceil(timeLeft(s)) })
  }, [])

  const finish = useCallback(() => {
    const s = stateRef.current
    const prev = scoresStore.getBest('catch')?.value
    const isRecord = scoresStore.submit('catch', s.score)
    setStatus('over')
    syncHud()
    setResult({ score: s.score, isRecord, prev, maxCombo: s.maxCombo })
    playSfx('win')
    if (isRecord && s.score > 0) celebrate(true)
  }, [playSfx, syncHud])

  useGameLoop((dt) => {
    const s = stateRef.current
    const events = update(s, dt, Math.random)
    for (const ev of events) {
      if (ev.type === 'timeup') finish()
      if (ev.type === 'miss') syncHud()
    }
    hudAcc.current += dt
    if (hudAcc.current > 0.1) {
      hudAcc.current = 0
      syncHud()
    }
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) render(ctx, s)
  }, status === 'running')

  const start = () => {
    const { w, h } = stateRef.current
    stateRef.current = createState(w, h)
    setResult(null)
    syncHud()
    setStatus('running')
  }

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (status !== 'running') return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * stateRef.current.w
    const y = ((e.clientY - rect.top) / rect.height) * stateRef.current.h
    const ev = tapAt(stateRef.current, x, y)
    if (ev && ev.type === 'catch') {
      playSfx(ev.kind === 'cloud' ? 'miss' : ev.kind === 'golden' ? 'golden' : 'catch')
      syncHud()
    }
  }

  return (
    <>
      <GameShell
        game={GAME}
        status={status}
        onStart={start}
        onPause={() => setStatus('paused')}
        onResume={() => setStatus('running')}
        areaClassName="h-[min(70dvh,640px)] min-h-[420px]"
        hud={
          <>
            <Badge className="text-sm">
              <Timer className="size-4" /> {hud.time}s
            </Badge>
            {hud.combo >= COMBO_THRESHOLD && (
              <Badge className="animate-pop border-lantern-500/40 bg-lantern-500/15 text-sm text-lantern-300">
                <Flame className="size-4" /> x2 · {t('games.catch.combo')} {hud.combo}
              </Badge>
            )}
            <Badge className="text-sm">
              {t('common.score')}: <strong className="text-gold-300 tabular-nums">{hud.score}</strong>
            </Badge>
          </>
        }
      >
        <div ref={wrapRef} className="absolute inset-0 bg-gradient-to-b from-night-800/30 to-night-950/60">
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            className="block size-full cursor-crosshair touch-none select-none"
            aria-label={t('games.catch.title')}
            role="img"
          />
        </div>
      </GameShell>

      <GameOverModal
        open={status === 'over' && result !== null}
        game={GAME}
        score={result?.score ?? 0}
        unit={t('games.catch.unit')}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={`${t('games.catch.combo')} max: ${result?.maxCombo ?? 0}`}
        onReplay={start}
      />
    </>
  )
}
