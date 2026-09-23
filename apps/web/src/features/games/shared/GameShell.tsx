import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Pause, Play } from 'lucide-react'
import type { SessionMode } from '@maf/shared/games/rules'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/SEO'
import { StartOverlay } from './StartOverlay'
import type { GameMeta } from './registry'

export type GameStatus = 'idle' | 'starting' | 'running' | 'paused' | 'over'

export function GameShell({
  game,
  status,
  onStart,
  onPause,
  onResume,
  hud,
  children,
  areaClassName = '',
  mode,
  onModeChange,
}: {
  game: GameMeta
  status: GameStatus
  onStart: () => void
  onPause?: () => void
  onResume?: () => void
  hud?: ReactNode
  children: ReactNode
  areaClassName?: string
  mode?: SessionMode
  onModeChange?: (mode: SessionMode) => void
}) {
  const { t } = useT()
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6">
      <SEO title={t(game.titleKey)} />
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/games"
          className="glass text-cream/80 hover:text-gold-300 inline-flex size-10 items-center justify-center rounded-full"
          aria-label={t('common.backToHub')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display text-glow text-moon-500 text-2xl sm:text-3xl">
          {game.emoji} {t(game.titleKey)}
        </h1>
        {mode === 'daily' && status !== 'idle' && (
          <span className="border-jade/40 bg-jade/10 text-jade rounded-full border px-2.5 py-0.5 text-xs font-bold">
            {t('games.shared.modeDaily')}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hud}
          {onPause && status === 'running' && (
            <Button variant="secondary" size="sm" onClick={onPause} aria-label={t('common.pause')}>
              <Pause className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        className={`border-gold-400/15 bg-night-950/75 relative overflow-hidden rounded-3xl border ${areaClassName}`}
      >
        {children}
        <AnimatePresence>
          {(status === 'idle' || status === 'starting') && (
            <StartOverlay
              key="start"
              game={game}
              onStart={onStart}
              mode={mode}
              onModeChange={onModeChange}
              starting={status === 'starting'}
            />
          )}
          {status === 'paused' && (
            <motion.div
              key="pause"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-night-950/70 absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 backdrop-blur-sm"
            >
              <p className="font-display text-moon-500 text-3xl">{t('games.shared.paused')}</p>
              <Button onClick={onResume} size="lg">
                <Play className="size-5" />
                {t('common.resume')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
