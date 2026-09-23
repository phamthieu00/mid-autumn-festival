import type { ReactNode } from 'react'
import { RotateCcw, Trophy } from 'lucide-react'
import { useT } from '@/i18n'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { LinkButton } from '@/components/ui/LinkButton'
import { ShareButton } from '@/components/ShareButton'
import type { GameMeta } from './registry'

export function GameOverModal({
  open,
  game,
  title,
  scoreLabel,
  score,
  unit,
  isRecord,
  previousBest,
  extra,
  onReplay,
  shareText,
  shareUrl,
  children,
}: {
  open: boolean
  game: GameMeta
  title?: string
  scoreLabel?: string
  score: number
  unit: string
  isRecord: boolean
  previousBest?: number
  extra?: string
  onReplay: () => void
  shareText?: string
  shareUrl?: string
  children?: ReactNode
}) {
  const { t } = useT()
  return (
    <Modal open={open} onClose={onReplay} dismissible={false} className="text-center">
      <div className="text-6xl">{isRecord ? '🏆' : game.emoji}</div>
      <h2 className="font-display text-glow text-moon-500 mt-3 text-3xl">
        {title ?? (isRecord ? t('games.shared.wellDone') : t('games.shared.gameOver'))}
      </h2>
      <p className="text-cream/60 mt-4 text-sm tracking-widest uppercase">
        {scoreLabel ?? t('games.shared.yourScore')}
      </p>
      <p className="font-display text-glow text-gold-400 text-6xl tabular-nums">
        {score} <span className="text-cream/70 text-2xl">{unit}</span>
      </p>
      {extra && <p className="text-cream/70 mt-1 text-sm">{extra}</p>}
      {isRecord ? (
        <p className="animate-pop bg-gold-500/15 text-gold-300 mt-3 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold">
          <Trophy className="size-4" /> {t('common.newRecord')}
        </p>
      ) : (
        previousBest != null && (
          <p className="text-cream/60 mt-3 text-sm">
            {t('games.shared.previousBest')}: {previousBest} {unit}
          </p>
        )
      )}
      {children}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onReplay} size="lg">
          <RotateCcw className="size-5" />
          {t('common.playAgain')}
        </Button>
        <ShareButton
          size="lg"
          url={shareUrl}
          text={
            shareText ??
            t('games.shared.shareText', { score: `${score} ${unit}`, game: t(game.titleKey) })
          }
        />
        <LinkButton to="/games" variant="ghost" size="lg">
          {t('common.backToHub')}
        </LinkButton>
      </div>
    </Modal>
  )
}
