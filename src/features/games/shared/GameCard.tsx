import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Trophy } from 'lucide-react'
import { useT } from '@/i18n'
import { useHighScores } from '@/features/scores/useHighScores'
import { Badge } from '@/components/ui/Badge'
import type { GameMeta } from './registry'

export function GameCard({
  game,
  index = 0,
  showBest = false,
}: {
  game: GameMeta
  index?: number
  showBest?: boolean
}) {
  const { t } = useT()
  const scores = useHighScores()
  const best = scores[game.id]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={game.path}
        className="glass group hover:border-gold-400/50 flex h-full flex-col overflow-hidden rounded-3xl transition"
      >
        <div
          className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${game.gradient} text-6xl`}
        >
          <span className="animate-float drop-shadow-[0_0_20px_rgba(255,209,102,0.55)] transition-transform group-hover:scale-110">
            {game.emoji}
          </span>
          {showBest && best && (
            <Badge className="absolute top-3 right-3">
              <Trophy className="size-3" /> {best.value} {t(game.unitKey)}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-moon-500 text-2xl">{t(game.titleKey)}</h3>
          <p className="text-cream/70 mt-2 flex-1 text-sm">{t(game.descKey)}</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gold-300 font-semibold group-hover:underline">
              {t('common.playNow')} →
            </span>
            {showBest && (
              <span className="text-cream/50 text-xs">
                {t('games.hub.bestLabel')}: {best ? `${best.value}` : t('common.noRecord')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
