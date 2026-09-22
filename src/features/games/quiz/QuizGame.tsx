import { useReducer, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { scoresStore } from '@/features/scores/scoresStore'
import { Badge } from '@/components/ui/Badge'
import { GameShell } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { buildOrders, correctDisplayIndex, initialQuizState, quizReducer, rankFor } from './quizReducer'
import { QUESTIONS } from './questions'
import { QuestionCard } from './QuestionCard'
import type { QuizAction, QuizState } from './types'

const GAME = gameById('quiz')

export default function QuizGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const [state, dispatch] = useReducer((s: QuizState, a: QuizAction) => quizReducer(s, a), initialQuizState)
  const [result, setResult] = useState<{ isRecord: boolean; prev?: number } | null>(null)

  const start = () => {
    setResult(null)
    dispatch({ type: 'START', ...buildOrders(), now: Date.now() })
  }

  const answer = (index: number) => {
    const correct = correctDisplayIndex(state) === index
    playSfx(correct ? 'correct' : 'wrong')
    dispatch({ type: 'ANSWER', index })
  }

  const next = () => {
    const action = { type: 'NEXT', now: Date.now() } as const
    const nextState = quizReducer(state, action)
    dispatch(action)
    if (nextState.status === 'finished' && nextState.startedAt != null && nextState.finishedAt != null) {
      const seconds = Math.floor((nextState.finishedAt - nextState.startedAt) / 1000)
      const prev = scoresStore.getBest('quiz')?.value
      const isRecord = scoresStore.submit('quiz', nextState.score, seconds)
      setResult({ isRecord, prev })
      playSfx('win')
      celebrate(nextState.score >= 8)
    }
  }

  const total = QUESTIONS.length
  const rank = rankFor(state.score, total)
  const rankTitle = t(`games.quiz.rank${rank}`)
  const shellStatus = state.status === 'idle' ? 'idle' : state.status === 'finished' ? 'over' : 'running'

  return (
    <>
      <GameShell
        game={GAME}
        status={shellStatus}
        onStart={start}
        areaClassName="min-h-[480px]"
        hud={
          <Badge className="text-sm">
            {t('common.score')}: <strong className="text-gold-300 tabular-nums">{state.score}</strong>/{total}
          </Badge>
        }
      >
        <AnimatePresence mode="wait">
          {state.status !== 'idle' && state.status !== 'finished' && (
            <QuestionCard
              key={state.current}
              question={QUESTIONS[state.order[state.current]]}
              optionOrder={state.optionOrders[state.current]}
              index={state.current}
              total={total}
              selected={state.selected}
              correctDisplay={correctDisplayIndex(state)}
              onAnswer={answer}
              onNext={next}
              isLast={state.current === total - 1}
            />
          )}
        </AnimatePresence>
        {state.status === 'idle' && <div className="h-[480px]" />}
      </GameShell>

      <GameOverModal
        open={state.status === 'finished' && result !== null}
        game={GAME}
        title={rankTitle}
        scoreLabel={t('games.quiz.resultTitle')}
        score={state.score}
        unit={`/ ${total} ${t('games.quiz.unit')}`}
        isRecord={result?.isRecord ?? false}
        previousBest={result?.prev}
        extra={t(`games.quiz.rank${rank}Desc`)}
        onReplay={start}
        shareText={t('games.quiz.shareText', { score: state.score, total, rank: rankTitle })}
      />
    </>
  )
}
