import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import type { QuizQuestion } from './types'

export function QuestionCard({
  question,
  optionOrder,
  index,
  total,
  selected,
  correctDisplay,
  onAnswer,
  onNext,
  isLast,
}: {
  question: QuizQuestion
  optionOrder: number[]
  index: number
  total: number
  selected: number | null
  correctDisplay: number
  onAnswer: (i: number) => void
  onNext: () => void
  isLast: boolean
}) {
  const { t, tx } = useT()
  const revealed = selected !== null
  const isCorrect = revealed && selected === correctDisplay
  const letters = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-2xl p-4 sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-widest text-lantern-400 uppercase">
        <span>{t('games.quiz.question', { current: index + 1, total })}</span>
        <span className="text-2xl">{question.emoji}</span>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-500 to-lantern-500"
          animate={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>
      <h2 className="text-xl leading-snug font-bold text-cream sm:text-2xl">{tx(question.question)}</h2>

      <div className="mt-6 grid gap-3">
        {optionOrder.map((optIdx, displayIdx) => {
          const chosen = selected === displayIdx
          const correct = displayIdx === correctDisplay
          return (
            <button
              key={optIdx}
              type="button"
              disabled={revealed}
              onClick={() => onAnswer(displayIdx)}
              className={cn(
                'glass flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-base transition',
                !revealed && 'hover:border-gold-400/60 hover:bg-white/10',
                revealed && correct && 'border-jade/70 bg-jade/15 text-jade',
                revealed && chosen && !correct && 'border-lantern-600/70 bg-lantern-600/15 text-lantern-300',
                revealed && !chosen && !correct && 'opacity-50',
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-night-950/60 text-sm font-bold">
                {revealed && correct ? <Check className="size-4" /> : revealed && chosen ? <X className="size-4" /> : letters[displayIdx]}
              </span>
              <span>{tx(question.options[optIdx])}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-6 rounded-2xl border p-4',
            isCorrect ? 'border-jade/40 bg-jade/10' : 'border-lantern-500/40 bg-lantern-500/10',
          )}
        >
          <p className={cn('font-bold', isCorrect ? 'text-jade' : 'text-lantern-300')}>
            {isCorrect ? t('games.quiz.correct') : t('games.quiz.wrong')}
          </p>
          <p className="mt-1 text-sm text-cream/80">{tx(question.explanation)}</p>
          <Button className="mt-4 w-full sm:w-auto" onClick={onNext} autoFocus>
            {isLast ? t('games.quiz.finish') : t('games.quiz.next')} →
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
