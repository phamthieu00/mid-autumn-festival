import { motion } from 'motion/react'
import { CalendarDays, Play } from 'lucide-react'
import type { SessionMode } from '@maf/shared/games/rules'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { GameMeta } from './registry'

export function StartOverlay({
  game,
  onStart,
  mode,
  onModeChange,
  starting = false,
}: {
  game: GameMeta
  onStart: () => void
  mode?: SessionMode
  onModeChange?: (mode: SessionMode) => void
  starting?: boolean
}) {
  const { t } = useT()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-night-950/70 absolute inset-0 z-20 flex items-center justify-center rounded-3xl p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        className="glass bg-night-800/90 w-full max-w-md rounded-3xl p-6 text-center sm:p-8"
      >
        <div className="animate-float mb-3 text-6xl">{game.emoji}</div>
        <h2 className="font-display text-glow text-moon-500 text-3xl">{t(game.titleKey)}</h2>
        {mode && onModeChange && (
          <div
            role="radiogroup"
            aria-label={t('games.shared.mode')}
            className="glass mx-auto mt-4 inline-flex rounded-full p-1 text-xs font-bold"
          >
            {(['free', 'daily'] as SessionMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => onModeChange(m)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition',
                  mode === m ? 'bg-gold-500 text-night-950' : 'text-cream/70 hover:text-cream',
                )}
              >
                {m === 'daily' && <CalendarDays className="size-3.5" />}
                {t(m === 'free' ? 'games.shared.modeFree' : 'games.shared.modeDaily')}
              </button>
            ))}
          </div>
        )}
        {mode === 'daily' && (
          <p className="text-cream/60 mt-2 text-xs">{t('games.shared.modeDailyHint')}</p>
        )}
        <p className="text-lantern-400 mt-4 text-left text-xs font-semibold tracking-widest uppercase">
          {t('games.shared.howToPlay')}
        </p>
        <p className="text-cream/80 mt-1 text-left text-sm leading-relaxed whitespace-pre-line">
          {t(game.howToKey)}
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={onStart} autoFocus disabled={starting}>
          <Play className="size-5" />
          {starting ? t('common.loading') : t('common.start')}
        </Button>
      </motion.div>
    </motion.div>
  )
}
