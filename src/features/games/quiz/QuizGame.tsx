import { useReducer, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { scoresStore } from '@/features/scores/scoresStore'
import { HudStat } from '../shared/HudStat'
import { GameShell } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import {
  categoryBreakdown,
  correctDisplayIndex,
  currentQuestion,
  initialQuizState,
  quizReducer,
  rankFor,
  startQuiz,
} from './quizReducer'
import { QuestionCard } from './QuestionCard'
import { Badge } from '@/components/ui/Badge'
import { CATEGORY_EMOJI } from './bank'
import { categoryKey } from './categoryKey'
import { QUIZ_SIZE, type QuizAction, type QuizState } from './types'

const GAME = gameById('quiz')

export default function QuizGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const [state, dispatch] = useReducer(
    (s: QuizState, a: QuizAction) => quizReducer(s, a),
    initialQuizState,
  )
  const [result, setResult] = useState<{ isRecord: boolean; prev?: number } | null>(null)

  const start = () => {
    setResult(null)
    dispatch(startQuiz())
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
    if (
      nextState.status === 'finished' &&
      nextState.startedAt != null &&
      nextState.finishedAt != null
    ) {
      const seconds = Math.floor((nextState.finishedAt - nextState.startedAt) / 1000)
      const prev = scoresStore.getBest('quiz')?.value
      const isRecord = scoresStore.submit('quiz', nextState.score, seconds)
      setResult({ isRecord, prev })
      playSfx('win')
      celebrate(nextState.score >= 8)
    }
  }

  const total = state.questions.length || QUIZ_SIZE
  const rank = rankFor(state.score, total)
  const rankTitle = t(`games.quiz.rank${rank}`)
  const shellStatus =
    state.status === 'idle' ? 'idle' : state.status === 'finished' ? 'over' : 'running'

  return (
    <>
      <GameShell
        game={GAME}
        status={shellStatus}
        onStart={start}
        areaClassName="min-h-[480px]"
        hud={<HudStat label={t('common.score')} value={`${state.score}/${total}`} />}
      >
        <AnimatePresence mode="wait">
          {state.status !== 'idle' && state.status !== 'finished' && (
            <QuestionCard
              key={state.current}
              question={currentQuestion(state)}
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
      >
        {state.status === 'finished' && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categoryBreakdown(state).map((c) => (
              <Badge
                key={c.category}
                className={c.correct === c.total ? 'border-jade/40 text-jade' : ''}
              >
                {CATEGORY_EMOJI[c.category as keyof typeof CATEGORY_EMOJI]}{' '}
                {t(categoryKey(c.category as never))} {c.correct}/{c.total}
              </Badge>
            ))}
          </div>
        )}
      </GameOverModal>
    </>
  )
}
