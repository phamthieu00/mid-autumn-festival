import { useEffect, useReducer, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { seededRng } from '@maf/shared/random'
import { toLetter, type Letter } from '@maf/shared/games/word/normalize'
import {
  initialWordState,
  MAX_WRONG,
  pickEntries,
  revealedMask,
  WORDS_PER_GAME,
  wordReducer,
} from '@maf/shared/games/word/wordReducer'
import type { WordAction, WordState } from '@maf/shared/games/word/types'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { scoresStore } from '@/features/scores/scoresStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { GameShell, type GameStatus } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { HudStat } from '../shared/HudStat'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { useGameSession } from '../shared/useGameSession'
import { ServerResultPanel } from '../shared/ServerResultPanel'
import { Keyboard } from './Keyboard'
import { LanternLives } from './LanternLives'

const GAME = gameById('word')

export default function WordGuessGame() {
  const { t, tx } = useT()
  const { playSfx } = useAudio()
  const session = useGameSession('word')
  const [state, dispatch] = useReducer(
    (s: WordState, a: WordAction) => wordReducer(s, a),
    initialWordState,
  )
  const [starting, setStarting] = useState(false)
  const [result, setResult] = useState<{ isRecord: boolean; prev?: number } | null>(null)

  const round = state.rounds[state.current]

  const start = async () => {
    setResult(null)
    setStarting(true)
    const outcome = await session.start()
    setStarting(false)
    if (outcome.kind === 'blocked') return
    const rng = outcome.kind === 'online' ? seededRng(outcome.session.seed) : Math.random
    dispatch({ type: 'START', entries: pickEntries(rng), now: Date.now() })
  }

  const guess = (letter: Letter) => {
    if (state.status !== 'playing' || !round || round.guessed.includes(letter)) return
    const action = { type: 'GUESS', letter } as const
    const next = wordReducer(state, action)
    const nextRound = next.rounds[state.current]
    dispatch(action)
    if (nextRound.status === 'won') {
      playSfx('match')
      celebrate(false)
    } else if (nextRound.status === 'lost') playSfx('miss')
    else if (nextRound.wrong > round.wrong) playSfx('wrong')
    else playSfx('correct')
  }

  const next = () => {
    const action = { type: 'NEXT', now: Date.now() } as const
    const nextState = wordReducer(state, action)
    dispatch(action)
    if (
      nextState.status === 'finished' &&
      nextState.startedAt != null &&
      nextState.finishedAt != null
    ) {
      const seconds = Math.floor((nextState.finishedAt - nextState.startedAt) / 1000)
      const prev = scoresStore.getBest('word')?.value
      const isRecord = scoresStore.submit('word', nextState.score, seconds)
      setResult({ isRecord, prev })
      playSfx('win')
      celebrate(nextState.solved === WORDS_PER_GAME)
      void session.finish({ rounds: nextState.rounds.map((r) => ({ guessed: r.guessed })) })
    }
  }

  useEffect(() => {
    if (state.status !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const l = toLetter(e.key)
      if (l) {
        e.preventDefault()
        guess(l)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const shellStatus: GameStatus = starting
    ? 'starting'
    : state.status === 'idle'
      ? 'idle'
      : state.status === 'finished'
        ? 'over'
        : 'running'
  const mask = round ? revealedMask(round.entry.word, round.guessed) : []
  const reveal = state.status === 'roundEnd'
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
        areaClassName="min-h-[520px] p-4 sm:p-6"
        hud={
          <>
            {round && (
              <HudStat
                value={t('games.word.wordProgress', {
                  current: state.current + 1,
                  total: state.rounds.length,
                })}
              />
            )}
            {round && (
              <HudStat
                accent="lantern"
                label={t('common.lives')}
                value={`${MAX_WRONG - round.wrong}/${MAX_WRONG}`}
              />
            )}
            <HudStat label={t('common.score')} value={state.score} />
          </>
        }
      >
        {round && (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <LanternLives wrong={round.wrong} />
            <div className="text-center">
              <Badge className="mb-2">{t(`games.word.cat.${round.entry.category}`)}</Badge>
              <p className="text-cream/80 text-base sm:text-lg">
                <span className="text-lantern-400 mr-1 font-semibold">{t('common.hint')}:</span>
                {tx(round.entry.hint)}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">
              {round.entry.word.split(' ').map((part, wi) => {
                const offset = round.entry.word
                  .split(' ')
                  .slice(0, wi)
                  .reduce((a, p) => a + p.length + 1, 0)
                return (
                  <div key={wi} className="flex gap-1">
                    {[...part].map((ch, ci) => {
                      const shown = mask[offset + ci] || reveal
                      const missed = reveal && !mask[offset + ci]
                      return (
                        <motion.span
                          key={ci}
                          initial={false}
                          animate={{ rotateX: shown ? 0 : 90, opacity: 1 }}
                          className={cn(
                            'font-display flex h-11 w-8 items-end justify-center border-b-2 pb-1 text-2xl sm:h-12 sm:w-9 sm:text-3xl',
                            shown
                              ? 'border-gold-400 text-moon-500'
                              : 'border-cream/30 text-transparent',
                            missed && 'text-lantern-400',
                          )}
                        >
                          {shown ? ch : '·'}
                        </motion.span>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <AnimatePresence mode="wait">
              {reveal ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'rounded-2xl border p-4 text-center',
                    round.status === 'won'
                      ? 'border-jade/40 bg-jade/10'
                      : 'border-lantern-500/40 bg-lantern-500/10',
                  )}
                >
                  <p
                    className={cn(
                      'font-bold',
                      round.status === 'won' ? 'text-jade' : 'text-lantern-300',
                    )}
                  >
                    {round.status === 'won'
                      ? t('games.word.solvedWord', { points: state.lastPoints })
                      : t('games.word.revealAnswer', { word: round.entry.word })}
                  </p>
                  <Button className="mt-4" onClick={next} autoFocus>
                    {state.current >= state.rounds.length - 1
                      ? t('games.word.finish')
                      : t('games.word.next')}{' '}
                    →
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="kb"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Keyboard
                    guessed={round.guessed}
                    word={round.entry.word}
                    disabled={state.status !== 'playing'}
                    onGuess={guess}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {!round && <div className="h-[480px]" />}
      </GameShell>

      <GameOverModal
        open={state.status === 'finished' && result !== null}
        game={GAME}
        score={state.score}
        unit={t('games.word.unit')}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={t('games.word.solvedCount', { solved: state.solved, total: state.rounds.length })}
        onReplay={() => void start()}
        shareUrl={shareUrl}
      >
        <ServerResultPanel session={session} gameId="word" unit={t('games.word.unit')} />
      </GameOverModal>
    </>
  )
}
