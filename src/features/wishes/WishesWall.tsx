import { useT } from '@/i18n'
import { useWishes } from './useWishes'
import { wishesStore } from './wishesStore'
import { WishLantern } from './WishLantern'
import { WISHES_VISIBLE } from './types'
import { cn } from '@/lib/cn'

export function WishesWall({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { t } = useT()
  const wishes = useWishes()
  const visible = wishes.slice(-WISHES_VISIBLE)

  return (
    <div
      className={cn(
        'border-gold-400/10 from-night-800/40 to-night-950/60 relative overflow-hidden rounded-3xl border bg-gradient-to-b',
        compact ? 'h-72' : 'h-[60dvh] min-h-96',
        className,
      )}
    >
      {visible.length === 0 ? (
        <p className="text-cream/50 absolute inset-0 flex items-center justify-center px-6 text-center">
          {t('wishes.empty')}
        </p>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0">
            {visible.map((w, i) => (
              <WishLantern
                key={w.id}
                wish={w}
                index={i}
                onRemove={(id) => wishesStore.remove(id)}
              />
            ))}
          </div>
          <div className="bg-night-950/60 text-cream/70 absolute top-3 left-4 rounded-full px-3 py-1 text-xs">
            {t('wishes.count', { count: wishes.length })}
          </div>
        </>
      )}
    </div>
  )
}
