import { motion, useReducedMotion } from 'motion/react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'

export function PuzzleTile({
  id,
  pos,
  n,
  img,
  canMove,
  won,
  onClick,
}: {
  id: number
  pos: number
  n: number
  img: string
  canMove: boolean
  won: boolean
  onClick: () => void
}) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const row = Math.floor(pos / n)
  const col = pos % n
  const homeRow = Math.floor(id / n)
  const homeCol = id % n
  const pct = 100 / n
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!canMove || won}
      aria-label={t('games.puzzle.tile', { n: id + 1 })}
      initial={false}
      animate={{ left: `${col * pct}%`, top: `${row * pct}%` }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
      style={{
        width: `${pct}%`,
        height: `${pct}%`,
        backgroundImage: `url(${img})`,
        backgroundSize: `${n * 100}% ${n * 100}%`,
        backgroundPosition: `${(homeCol / (n - 1)) * 100}% ${(homeRow / (n - 1)) * 100}%`,
      }}
      className={cn(
        'border-gold-400/30 bg-night-800 shadow-glass absolute overflow-hidden border transition-[border-radius,border-color] duration-500',
        won ? 'rounded-none border-transparent' : 'rounded-lg',
        canMove && !won && 'hover:border-gold-400/80 cursor-pointer hover:brightness-110',
      )}
    />
  )
}
