import { useT } from '@/i18n'
import { useWishes } from './useWishes'
import { wishesStore } from './wishesStore'
import { WishLantern } from './WishLantern'
import { WISHES_VISIBLE } from './types'
import { cn } from '@/lib/cn'

export function WishesWall({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useT()
  const wishes = useWishes()
  const visible = wishes.slice(-WISHES_VISIBLE)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-gold-400/10 bg-gradient-to-b from-night-800/40 to-night-950/60',
        compact ? 'h-72' : 'h-[60dvh] min-h-96',
        className,
      )}
    >
      {visible.length === 0 ? (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-cream/50">
          {t('wishes.empty')}
        </p>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0">
            {visible.map((w, i) => (
              <WishLantern key={w.id} wish={w} index={i} onRemove={(id) => wishesStore.remove(id)} />
            ))}
          </div>
          <div className="absolute top-3 left-4 rounded-full bg-night-950/60 px-3 py-1 text-xs text-cream/70">
            {t('wishes.count', { count: wishes.length })}
          </div>
        </>
      )}
    </div>
  )
}
