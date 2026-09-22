import { motion, useReducedMotion } from 'motion/react'
import { useT } from '@/i18n'
import { MooncakeIcon } from '@/components/ui/MooncakeIcon'
import { cn } from '@/lib/cn'
import { flavorById } from './flavors'
import type { MemoryCard as CardType } from './types'

export function MemoryCard({
  card,
  index,
  onFlip,
  disabled,
}: {
  card: CardType
  index: number
  onFlip: (id: number) => void
  disabled: boolean
}) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const flavor = flavorById(card.flavorId)
  const Icon = flavor.icon
  const shown = card.isFlipped || card.isMatched

  return (
    <button
      type="button"
      onClick={() => onFlip(card.id)}
      disabled={disabled || shown}
      aria-label={shown ? t(flavor.labelKey) : t('games.match.cardHidden', { n: index + 1 })}
      aria-pressed={shown}
      className="relative aspect-square w-full [perspective:800px] focus-visible:outline-none"
    >
      <motion.div
        className="relative size-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={reduced ? {} : { rotateY: shown ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* back */}
        <div
          className={cn(
            'flip-card border-gold-400/25 from-night-700 to-night-900 shadow-glass absolute inset-0 flex items-center justify-center rounded-2xl border bg-gradient-to-br transition',
            !shown && !disabled && 'hover:border-gold-400/60 hover:shadow-gold-sm',
            reduced && shown && 'opacity-0',
          )}
        >
          <span className="font-display text-gold-400/70 text-3xl">月</span>
        </div>
        {/* front */}
        <div
          className={cn(
            'flip-card shadow-glass absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border p-2',
            card.isMatched ? 'border-jade/60 bg-jade/10' : 'border-gold-400/40 bg-night-800',
            reduced && !shown && 'opacity-0',
          )}
          style={{ transform: reduced ? undefined : 'rotateY(180deg)' }}
        >
          <div className="relative size-3/5">
            <MooncakeIcon
              color={flavor.color}
              className="size-full drop-shadow-[0_0_10px_rgba(255,209,102,0.35)]"
            />
            <Icon
              className="text-night-950/80 absolute inset-0 m-auto size-1/3"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-cream/80 text-[10px] font-semibold sm:text-xs">
            {t(flavor.labelKey)}
          </span>
        </div>
      </motion.div>
    </button>
  )
}
