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
}) {
  const { t } = useT()
  return (
    <Modal open={open} onClose={onReplay} dismissible={false} className="text-center">
      <div className="text-6xl">{isRecord ? '🏆' : game.emoji}</div>
      <h2 className="font-display text-glow mt-3 text-3xl text-moon-500">
        {title ?? (isRecord ? t('games.shared.wellDone') : t('games.shared.gameOver'))}
      </h2>
      <p className="mt-4 text-sm tracking-widest text-cream/60 uppercase">{scoreLabel ?? t('games.shared.yourScore')}</p>
      <p className="font-display text-glow text-6xl text-gold-400 tabular-nums">
        {score} <span className="text-2xl text-cream/70">{unit}</span>
      </p>
      {extra && <p className="mt-1 text-sm text-cream/70">{extra}</p>}
      {isRecord ? (
        <p className="animate-pop mt-3 inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-4 py-1.5 text-sm font-bold text-gold-300">
          <Trophy className="size-4" /> {t('common.newRecord')}
        </p>
      ) : (
        previousBest != null && (
          <p className="mt-3 text-sm text-cream/60">
            {t('games.shared.previousBest')}: {previousBest} {unit}
          </p>
        )
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onReplay} size="lg">
          <RotateCcw className="size-5" />
          {t('common.playAgain')}
        </Button>
        <ShareButton
          size="lg"
          text={shareText ?? t('games.shared.shareText', { score: `${score} ${unit}`, game: t(game.titleKey) })}
        />
        <LinkButton to="/games" variant="ghost" size="lg">
          {t('common.backToHub')}
        </LinkButton>
      </div>
    </Modal>
  )
}
