import { useReducer, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { seededRng } from '@maf/shared/random'
import { CATEGORY_EMOJI } from '@maf/shared/quiz/bank/index'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { scoresStore } from '@/features/scores/scoresStore'
import { Badge } from '@/components/ui/Badge'
import { GameShell, type GameStatus } from '../shared/GameShell'
import { GameOverModal } from '../shared/GameOverModal'
import { HudStat } from '../shared/HudStat'
import { celebrate } from '../shared/celebrate'
import { gameById } from '../shared/registry'
import { useGameSession } from '../shared/useGameSession'
import { ServerResultPanel } from '../shared/ServerResultPanel'
import {
  categoryBreakdown,
  correctDisplayIndex,
  currentQuestion,
  initialQuizState,
  originalOptionIndex,
  quizReducer,
  rankFor,
  startOnlineQuiz,
  startQuiz,
} from './quizReducer'
import { QuestionCard } from './QuestionCard'
import { categoryKey } from './categoryKey'
import { QUIZ_SIZE, type QuizAction, type QuizState } from './types'

const GAME = gameById('quiz')

export default function QuizGame() {
  const { t } = useT()
  const { playSfx } = useAudio()
  const session = useGameSession('quiz')
  const [state, dispatch] = useReducer(
    (s: QuizState, a: QuizAction) => quizReducer(s, a),
    initialQuizState,
  )
  const [starting, setStarting] = useState(false)
  const [result, setResult] = useState<{ isRecord: boolean; prev?: number } | null>(null)
  const online = session.state === 'online'

  const start = async () => {
    setResult(null)
    setStarting(true)
    const outcome = await session.start()
    setStarting(false)
    if (outcome.kind === 'blocked') return
    if (outcome.kind === 'online' && outcome.session.quiz?.length) {
      dispatch(startOnlineQuiz(outcome.session.quiz, seededRng(outcome.session.seed)))
    } else {
      dispatch(startQuiz())
    }
  }

  const answer = async (displayIndex: number) => {
    if (state.status !== 'answering') return
    let correct: boolean
    if (online) {
      const res = await session.answer(state.current, originalOptionIndex(state, displayIndex))
      if (res) {
        dispatch({
          type: 'SET_KEY',
          questionIndex: state.current,
          correctIndex: res.correctIndex,
          explanation: res.explanation,
        })
        correct = res.correct
      } else {
        correct = false
      }
    } else {
      correct = correctDisplayIndex(state) === displayIndex
    }
    playSfx(correct ? 'correct' : 'wrong')
    dispatch({ type: 'ANSWER', index: displayIndex })
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
      void session.finish({})
    }
  }

  const total = state.questions.length || QUIZ_SIZE
  const rank = rankFor(state.score, total)
  const rankTitle = t(`games.quiz.rank${rank}`)
  const shellStatus: GameStatus = starting
    ? 'starting'
    : state.status === 'idle'
      ? 'idle'
      : state.status === 'finished'
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
              onAnswer={(i) => void answer(i)}
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
        onReplay={() => void start()}
        shareUrl={shareUrl}
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
        <ServerResultPanel session={session} gameId="quiz" unit={t('games.quiz.unit')} />
      </GameOverModal>
    </>
  )
}
