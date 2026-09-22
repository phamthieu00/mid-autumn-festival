import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { ALPHABET, type Letter } from './normalize'

export function Keyboard({
  guessed,
  word,
  disabled,
  onGuess,
}: {
  guessed: readonly Letter[]
  word: string
  disabled: boolean
  onGuess: (l: Letter) => void
}) {
  const { t } = useT()
  const bases = new Set(
    [...word.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()].filter((c) => c !== ' '),
  )
  return (
    <div
      role="group"
      aria-label={t('games.word.keyboardLabel')}
      className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 sm:gap-2"
    >
      {ALPHABET.map((letter) => {
        const used = guessed.includes(letter)
        const hit = used && bases.has(letter)
        return (
          <button
            key={letter}
            type="button"
            disabled={disabled || used}
            aria-pressed={used}
            onClick={() => onGuess(letter)}
            className={cn(
              'glass min-h-11 rounded-xl text-base font-bold transition',
              !used && !disabled && 'hover:border-gold-400/60 hover:bg-white/10 active:scale-95',
              hit && 'border-jade/60 bg-jade/15 text-jade',
              used && !hit && 'opacity-30',
            )}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
