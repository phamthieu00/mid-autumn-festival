import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import type { GameMeta } from './registry'

export function StartOverlay({ game, onStart }: { game: GameMeta; onStart: () => void }) {
  const { t } = useT()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-night-950/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl bg-night-800/90 p-6 text-center sm:p-8"
      >
        <div className="animate-float mb-3 text-6xl">{game.emoji}</div>
        <h2 className="font-display text-glow text-3xl text-moon-500">{t(game.titleKey)}</h2>
        <p className="mt-4 text-left text-xs font-semibold tracking-widest text-lantern-400 uppercase">
          {t('games.shared.howToPlay')}
        </p>
        <p className="mt-1 text-left text-sm leading-relaxed whitespace-pre-line text-cream/80">{t(game.howToKey)}</p>
        <Button size="lg" className="mt-6 w-full" onClick={onStart} autoFocus>
          <Play className="size-5" />
          {t('common.start')}
        </Button>
      </motion.div>
    </motion.div>
  )
}
