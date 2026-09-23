import { useEffect, useMemo, useReducer, useState } from 'react'
import { Eye, Timer } from 'lucide-react'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { formatTime } from '@/lib/format'
import { scoresStore } from '@/features/scores/scoresStore'
import { cn } from '@/lib/cn'
import { GameShell } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { HudStat } from '../shared/HudStat'
import { useStopwatch } from '../shared/useStopwatch'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { PuzzleTile } from './PuzzleTile'
import {
  blankId,
  canSlide,
  initialPuzzleState,
  puzzleReducer,
  shuffleSolvable,
} from '@maf/shared/games/puzzle/puzzleLogic'
import { renderSceneDataUrl } from './scene'
import type { Dir, PuzzleAction, PuzzleSize, PuzzleState } from '@maf/shared/games/puzzle/types'

const GAME = gameById('puzzle')
const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export default function MoonPuzzleGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const [state, dispatch] = useReducer(
    (s: PuzzleState, a: PuzzleAction) => puzzleReducer(s, a),
    initialPuzzleState,
  )
  const [size, setSize] = useState<PuzzleSize>(3)
  const [peek, setPeek] = useState(false)
  const [result, setResult] = useState<{
    isRecord: boolean
    prev?: number
    counted: boolean
  } | null>(null)
  const elapsed = useStopwatch(state.startedAt, state.finishedAt)
  const img = useMemo(() => renderSceneDataUrl(600), [])

  const n = state.tiles.length ? state.size : size
  const tiles = state.tiles.length ? state.tiles : Array.from({ length: n * n }, (_, i) => i)
  const blank = blankId(n)

  const start = () => {
    setResult(null)
    dispatch({ type: 'START', size, tiles: shuffleSolvable(size), now: Date.now() })
  }

  const move = (action: PuzzleAction) => {
    const next = puzzleReducer(state, action)
    if (next === state) return
    playSfx('flip')
    dispatch(action)
    if (next.status === 'won' && next.startedAt != null && next.finishedAt != null) {
      const seconds = Math.floor((next.finishedAt - next.startedAt) / 1000)
      const counted = next.size === 3
      const prev = counted ? scoresStore.getBest('puzzle')?.value : undefined
      const isRecord = counted ? scoresStore.submit('puzzle', next.moves, seconds) : false
      setResult({ isRecord, prev, counted })
      playSfx('win')
      celebrate(isRecord || next.size === 4)
    }
  }

  useEffect(() => {
    if (state.status !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.key]
      if (!dir) return
      e.preventDefault()
      move({ type: 'KEY', dir, now: Date.now() })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const shellStatus = state.status === 'idle' ? 'idle' : state.status === 'won' ? 'over' : 'running'

  return (
    <>
      <GameShell
        game={GAME}
        status={shellStatus}
        onStart={start}
        areaClassName="p-3 sm:p-5"
        hud={
          <>
            <div
              role="group"
              aria-label={t('games.puzzle.size')}
              className="glass inline-flex rounded-full p-0.5 text-xs font-bold"
            >
              {([3, 4] as PuzzleSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={state.status === 'running'}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className={cn(
                    'rounded-full px-2.5 py-1 transition disabled:opacity-60',
                    size === s ? 'bg-gold-500 text-night-950' : 'text-cream/70',
                  )}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
            <HudStat icon={Timer} value={formatTime(elapsed)} />
            <HudStat label={t('common.moves')} value={state.moves} />
          </>
        }
      >
        <div className="mx-auto flex max-w-[420px] flex-col gap-3">
          <div className="bg-night-950/60 relative aspect-square w-full overflow-hidden rounded-2xl">
            {tiles.map((id, pos) =>
              id === blank && state.status !== 'won' ? null : (
                <PuzzleTile
                  key={id}
                  id={id}
                  pos={pos}
                  n={n}
                  img={img}
                  canMove={state.status === 'running' && canSlide(tiles, n, pos)}
                  won={state.status === 'won'}
                  onClick={() => move({ type: 'SLIDE', pos, now: Date.now() })}
                />
              ),
            )}
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 bg-cover transition-opacity duration-200',
                peek ? 'opacity-100' : 'opacity-0',
              )}
              style={{ backgroundImage: `url(${img})` }}
            />
          </div>
          <div className="text-cream/60 flex items-center justify-between text-xs">
            <button
              type="button"
              onPointerDown={() => setPeek(true)}
              onPointerUp={() => setPeek(false)}
              onPointerLeave={() => setPeek(false)}
              onKeyDown={(e) => e.key === ' ' && setPeek(true)}
              onKeyUp={() => setPeek(false)}
              className="glass text-cream/80 hover:text-gold-300 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold select-none"
            >
              <Eye className="size-4" /> {t('games.puzzle.peek')}
            </button>
            {size === 4 && <span>{t('games.puzzle.challengeNote')}</span>}
          </div>
        </div>
      </GameShell>

      <GameOverModal
        open={state.status === 'won' && result !== null}
        game={GAME}
        title={t('games.puzzle.solved')}
        scoreLabel={t('common.moves')}
        score={state.moves}
        unit={t('games.puzzle.unit')}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={`${t('common.time')}: ${formatTime(elapsed)}${result && !result.counted ? ` · ${t('games.puzzle.challengeNote')}` : ''}`}
        onReplay={start}
      />
    </>
  )
}
