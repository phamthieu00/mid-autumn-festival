import { LanternIcon } from '@/components/ui/LanternIcon'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { useWishes } from './useWishes'
import { wishesStore } from './wishesStore'
import { WishLantern } from './WishLantern'
import { WISHES_VISIBLE } from './types'

export function WishesWall({
  className,
  compact = false,
  hideId,
  highlightId,
}: {
  className?: string
  compact?: boolean
  hideId?: string | null
  highlightId?: string | null
}) {
  const { t } = useT()
  const wishes = useWishes()
  const visible = wishes.slice(-WISHES_VISIBLE).filter((w) => w.id !== hideId)

  return (
    <div
      className={cn(
        'border-gold-400/10 from-night-800/40 to-night-950/60 relative overflow-hidden rounded-3xl border bg-gradient-to-b',
        compact ? 'h-72' : 'h-[60dvh] min-h-96',
        className,
      )}
    >
      {visible.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <LanternIcon color="gold" glow={false} className="h-16 w-10 opacity-30" />
          <p className="font-display text-moon-500/70 text-xl">{t('wishes.emptyTitle')}</p>
          <p className="text-cream/50 text-sm">{t('wishes.emptyHint')}</p>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0">
            {visible.map((w, i) => (
              <WishLantern
                key={w.id}
                wish={w}
                index={i}
                highlight={w.id === highlightId}
                onRemove={(id) => wishesStore.remove(id)}
              />
            ))}
          </div>
          <div className="bg-night-950/60 text-cream/70 absolute top-3 left-4 rounded-full px-3 py-1 text-xs">
            ✨ {t('wishes.count', { count: wishes.length })}
          </div>
        </>
      )}
    </div>
  )
}
