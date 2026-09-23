import { useCallback, useEffect, useRef, useState } from 'react'
import { Flame } from 'lucide-react'
import { generateChart } from '@maf/shared/games/rhythm/chart'
import { BEAT, LANE_KEYS, SCHEDULE_AHEAD } from '@maf/shared/games/rhythm/constants'
import { advance, applyHit, createState, multiplier } from '@maf/shared/games/rhythm/engine'
import type { Lane, RhythmState } from '@maf/shared/games/rhythm/types'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { scoresStore } from '@/features/scores/scoresStore'
import { GameShell, type GameStatus } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { HudStat } from '../shared/HudStat'
import { useGameLoop } from '../shared/useGameLoop'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { useGameSession } from '../shared/useGameSession'
import { ServerResultPanel } from '../shared/ServerResultPanel'
import { LANE_SFX } from './laneSfx'
import { LanePads } from './LanePads'
import { render } from './renderer'

const GAME = gameById('rhythm')

export default function RhythmGame() {
  const { t } = useT()
  const { playSfx, scheduleSfx, getTime } = useAudio()
  const session = useGameSession('rhythm')
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<RhythmState>(createState(generateChart(1)))
  const startCtx = useRef(0)
  const pausedAt = useRef(0)
  const schedIdx = useRef(0)
  const sizeRef = useRef({ w: 600, h: 400 })
  const hudAcc = useRef(0)

  const [status, setStatus] = useState<GameStatus>('idle')
  const [hud, setHud] = useState({ score: 0, combo: 0 })
  const [result, setResult] = useState<{
    score: number
    isRecord: boolean
    prev?: number
    counts: RhythmState['counts']
    maxCombo: number
  } | null>(null)

  const labels = {
    perfect: t('games.rhythm.perfect'),
    good: t('games.rhythm.good'),
    miss: t('games.rhythm.miss'),
  }

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
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w: rect.width, h: rect.height }
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const songTime = useCallback(() => getTime() - startCtx.current, [getTime])

  const finish = useCallback(() => {
    const s = stateRef.current
    const prev = scoresStore.getBest('rhythm')?.value
    const isRecord = scoresStore.submit('rhythm', s.score)
    setStatus('over')
    setHud({ score: s.score, combo: s.combo })
    setResult({ score: s.score, isRecord, prev, counts: s.counts, maxCombo: s.maxCombo })
    playSfx('win')
    if (isRecord && s.score > 0) celebrate(true)
    const judgements = s.chart.notes.map((n) =>
      n.judged === 'perfect' ? 2 : n.judged === 'good' ? 1 : 0,
    )
    void session.finish({ judgements })
  }, [playSfx, session])

  useGameLoop((dt) => {
    const s = stateRef.current
    const now = songTime()
    const notes = s.chart.notes
    while (
      schedIdx.current < notes.length &&
      notes[schedIdx.current].time <= now + SCHEDULE_AHEAD
    ) {
      const n = notes[schedIdx.current]
      scheduleSfx(LANE_SFX[n.lane], startCtx.current + n.time)
      schedIdx.current++
    }
    advance(s, now)
    hudAcc.current += dt
    if (hudAcc.current > 0.1) {
      hudAcc.current = 0
      setHud({ score: s.score, combo: s.combo })
    }
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) render(ctx, s, now, sizeRef.current.w, sizeRef.current.h, labels)
    if (s.finished) finish()
  }, status === 'running')

  const start = async () => {
    setStatus('starting')
    const outcome = await session.start()
    if (outcome.kind === 'blocked') {
      setStatus('idle')
      return
    }
    const seed =
      outcome.kind === 'online' ? outcome.session.seed : Math.floor(Math.random() * 1e6) + 1
    stateRef.current = createState(generateChart(seed))
    schedIdx.current = 0
    setResult(null)
    setHud({ score: 0, combo: 0 })
    startCtx.current = getTime() + 0.3
    for (let k = 0; k < 4; k++) scheduleSfx('drumHigh', startCtx.current + k * BEAT)
    setStatus('running')
  }

  const pause = useCallback(() => {
    if (status !== 'running') return
    pausedAt.current = songTime()
    setStatus('paused')
  }, [status, songTime])

  const resume = () => {
    startCtx.current = getTime() - pausedAt.current
    const notes = stateRef.current.chart.notes
    schedIdx.current = notes.findIndex((n) => n.time > pausedAt.current)
    if (schedIdx.current < 0) schedIdx.current = notes.length
    setStatus('running')
  }

  const hit = useCallback(
    (lane: Lane) => {
      if (status !== 'running') return
      const verdict = applyHit(stateRef.current, lane, songTime())
      if (verdict === 'perfect') playSfx('pop')
      setHud({ score: stateRef.current.score, combo: stateRef.current.combo })
    },
    [status, songTime, playSfx],
  )

  useEffect(() => {
    if (status !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const lane = (LANE_KEYS as readonly string[]).indexOf(e.key.toLowerCase())
      if (lane >= 0) {
        e.preventDefault()
        hit(lane as Lane)
      } else if (e.key === 'Escape' || e.key === 'p') pause()
    }
    const onVis = () => document.hidden && pause()
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [status, hit, pause])

  const mult = multiplier(hud.combo)
  const shareUrl = session.result
    ? `${window.location.origin}/r/${session.result.publicId}`
    : undefined

  return (
    <>
      <GameShell
        game={GAME}
        status={status}
        onStart={() => void start()}
        onPause={pause}
        onResume={resume}
        mode={session.mode}
        onModeChange={session.setMode}
        areaClassName="flex h-[min(72dvh,680px)] min-h-[440px] flex-col"
        hud={
          <>
            {hud.combo >= 10 && (
              <HudStat icon={Flame} accent="lantern" pulse label={`x${mult}`} value={hud.combo} />
            )}
            <HudStat label={t('common.score')} value={hud.score} />
          </>
        }
      >
        <div ref={wrapRef} className="relative min-h-0 flex-1">
          <canvas
            ref={canvasRef}
            className="block size-full touch-none select-none"
            role="img"
            aria-label={t('games.rhythm.title')}
          />
        </div>
        <LanePads onHit={hit} disabled={status !== 'running'} />
      </GameShell>

      <GameOverModal
        open={status === 'over' && result !== null}
        game={GAME}
        title={t('games.rhythm.finished')}
        score={result?.score ?? 0}
        unit={t('games.rhythm.unit')}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={
          result
            ? `${labels.perfect} ${result.counts.perfect} · ${labels.good} ${result.counts.good} · ${labels.miss} ${result.counts.miss} · ${t('games.rhythm.maxCombo')} ${result.maxCombo}`
            : undefined
        }
        onReplay={() => void start()}
        shareUrl={shareUrl}
      >
        <ServerResultPanel session={session} gameId="rhythm" unit={t('games.rhythm.unit')} />
      </GameOverModal>
    </>
  )
}
