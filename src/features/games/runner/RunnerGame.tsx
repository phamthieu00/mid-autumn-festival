import { useCallback, useEffect, useRef, useState } from 'react'
import { Footprints } from 'lucide-react'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { scoresStore } from '@/features/scores/scoresStore'
import { GameShell, type GameStatus } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { HudStat } from '../shared/HudStat'
import { useGameLoop } from '../shared/useGameLoop'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { createState, metres, requestJump, score, update } from './engine'
import { render } from './renderer'
import type { RunnerState } from './types'

const GAME = gameById('runner')

export default function RunnerGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<RunnerState>(createState(800, 450))
  const hudAcc = useRef(0)
  const finishTimer = useRef<number | null>(null)

  const [status, setStatus] = useState<GameStatus>('idle')
  const [hud, setHud] = useState({ score: 0, metres: 0, collected: 0 })
  const [result, setResult] = useState<{
    score: number
    isRecord: boolean
    prev?: number
    metres: number
    collected: number
  } | null>(null)

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
      const s = stateRef.current
      const groundBefore = s.h
      s.w = rect.width
      s.h = rect.height
      if (s.elapsed === 0) s.player.y = s.h * 0.78 - 44
      else s.player.y += (s.h - groundBefore) * 0.78
      if (ctx) render(ctx, s, reduced)
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [reduced])

  const syncHud = useCallback(() => {
    const s = stateRef.current
    setHud({ score: score(s), metres: metres(s), collected: s.collected })
  }, [])

  const finish = useCallback(() => {
    const s = stateRef.current
    const final = score(s)
    const prev = scoresStore.getBest('runner')?.value
    const isRecord = scoresStore.submit('runner', final)
    setStatus('over')
    syncHud()
    setResult({ score: final, isRecord, prev, metres: metres(s), collected: s.collected })
    playSfx('win')
    if (isRecord && final > 0) celebrate(true)
  }, [playSfx, syncHud])

  useGameLoop((dt) => {
    const s = stateRef.current
    const events = update(s, dt, Math.random)
    for (const ev of events) {
      if (ev.type === 'pickup') playSfx(ev.kind === 'star' ? 'golden' : 'catch')
      if (ev.type === 'hit') {
        playSfx('miss')
        if (finishTimer.current == null) finishTimer.current = window.setTimeout(finish, 500)
      }
    }
    hudAcc.current += dt
    if (hudAcc.current > 0.1) {
      hudAcc.current = 0
      syncHud()
    }
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) render(ctx, s, reduced)
  }, status === 'running')

  useEffect(
    () => () => {
      if (finishTimer.current != null) window.clearTimeout(finishTimer.current)
    },
    [],
  )

  const start = () => {
    const { w, h } = stateRef.current
    stateRef.current = createState(w, h)
    finishTimer.current = null
    setResult(null)
    syncHud()
    setStatus('running')
  }

  const jump = useCallback(() => {
    if (status !== 'running') return
    const ev = requestJump(stateRef.current)
    if (ev) playSfx('jump')
  }, [status, playSfx])

  useEffect(() => {
    if (status !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (!e.repeat) jump()
      } else if (e.key === 'Escape' || e.key === 'p') {
        setStatus('paused')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, jump])

  return (
    <>
      <GameShell
        game={GAME}
        status={status}
        onStart={start}
        onPause={() => setStatus('paused')}
        onResume={() => setStatus('running')}
        areaClassName="h-[min(60dvh,520px)] min-h-[340px]"
        hud={
          <>
            <HudStat icon={Footprints} value={`${hud.metres} m`} />
            <HudStat label={t('games.runner.collected')} value={hud.collected} />
            <HudStat label={t('common.score')} value={hud.score} />
          </>
        }
      >
        <div
          ref={wrapRef}
          className="absolute inset-0"
          onPointerDown={(e) => {
            e.preventDefault()
            jump()
          }}
        >
          <canvas
            ref={canvasRef}
            className="block size-full cursor-pointer touch-none select-none"
            role="img"
            aria-label={t('games.runner.title')}
          />
        </div>
      </GameShell>

      <GameOverModal
        open={status === 'over' && result !== null}
        game={GAME}
        title={t('games.runner.crashed')}
        score={result?.score ?? 0}
        unit={t('games.runner.unit')}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={`${t('common.distance')}: ${result?.metres ?? 0} m · ${t('games.runner.collected')}: ${result?.collected ?? 0}`}
        onReplay={start}
      />
    </>
  )
}
