import { useEffect, useReducer, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import { seededRng } from '@maf/shared/random'
import { createDeck, initialMatchState, matchReducer } from '@maf/shared/games/match/matchReducer'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { formatTime } from '@/lib/format'
import { scoresStore } from '@/features/scores/scoresStore'
import { GameShell, type GameStatus } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { HudStat } from '../shared/HudStat'
import { useStopwatch } from '../shared/useStopwatch'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { useGameSession } from '../shared/useGameSession'
import { ServerResultPanel } from '../shared/ServerResultPanel'
import { MemoryCard } from './MemoryCard'

const GAME = gameById('match')

export default function MooncakeMatchGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const session = useGameSession('match')
  const [state, dispatch] = useReducer(matchReducer, initialMatchState)
  const elapsed = useStopwatch(state.startedAt, state.finishedAt)
  const [starting, setStarting] = useState(false)
  const [result, setResult] = useState<{ isRecord: boolean; prev?: number } | null>(null)
  const prevMatched = useRef(0)

  useEffect(() => {
    if (state.status !== 'checking') return
    playSfx('wrong')
    const id = window.setTimeout(() => dispatch({ type: 'RESOLVE' }), 800)
    return () => window.clearTimeout(id)
  }, [state.status, playSfx])

  useEffect(() => {
    if (state.matchedPairs > prevMatched.current && state.status !== 'won') playSfx('match')
    prevMatched.current = state.matchedPairs
  }, [state.matchedPairs, state.status, playSfx])

  const start = async () => {
    setResult(null)
    prevMatched.current = 0
    setStarting(true)
    const outcome = await session.start()
    setStarting(false)
    if (outcome.kind === 'blocked') return
    const rng = outcome.kind === 'online' ? seededRng(outcome.session.seed) : Math.random
    dispatch({ type: 'START', cards: createDeck(rng) })
  }

  const flip = (id: number) => {
    playSfx('flip')
    const action = { type: 'FLIP', id, now: Date.now() } as const
    const next = matchReducer(state, action)
    dispatch(action)
    if (next.status === 'won' && next.startedAt != null && next.finishedAt != null) {
      const seconds = Math.floor((next.finishedAt - next.startedAt) / 1000)
      const prev = scoresStore.getBest('match')?.value
      const isRecord = scoresStore.submit('match', next.moves, seconds)
      setResult({ isRecord, prev })
      playSfx('win')
      celebrate(isRecord)
      void session.finish({ moves: next.moves, seconds })
    }
  }

  const shellStatus: GameStatus = starting
    ? 'starting'
    : state.status === 'idle'
      ? 'idle'
      : state.status === 'won'
        ? 'over'
        : 'running'
  const shareUrl = session.result
    ? `${window.location.origin}/r/${session.result.publicId}`
    : undefined

  return (
    <>
      <GameShell
        game={GAME}
        status={shellStatus}
        onStart={() => void start()}
        mode={session.mode}
        onModeChange={session.setMode}
        areaClassName="p-3 sm:p-5"
        hud={
          <>
            <HudStat icon={Timer} value={formatTime(elapsed)} />
            <HudStat
              label={t('games.match.pairs')}
              value={`${state.matchedPairs}/${state.totalPairs}`}
            />
            <HudStat label={t('common.moves')} value={state.moves} />
          </>
        }
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 sm:gap-3">
          {(state.cards.length ? state.cards : createDeck(seededRng(1))).map((card, i) => (
            <MemoryCard
              key={card.id}
              card={state.cards.length ? card : { ...card, isFlipped: false, isMatched: false }}
              index={i}
              onFlip={flip}
              disabled={state.status !== 'running'}
            />
          ))}
        </div>
      </GameShell>

      <GameOverModal
        open={state.status === 'won' && result !== null}
        game={GAME}
        title={t('games.shared.wellDone')}
        scoreLabel={t('common.moves')}
        score={state.moves}
        unit={t('games.match.unit')}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={`${t('common.time')}: ${formatTime(elapsed)}`}
        onReplay={() => void start()}
        shareUrl={shareUrl}
      >
        <ServerResultPanel session={session} gameId="match" unit={t('games.match.unit')} />
      </GameOverModal>
    </>
  )
}
