import { useState } from 'react'
import { X } from 'lucide-react'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { LANTERN_COLORS } from '@/components/ui/lanternColors'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import type { Wish } from './types'

export function WishLantern({
  wish,
  index,
  highlight = false,
  onRemove,
}: {
  wish: Wish
  index: number
  highlight?: boolean
  onRemove?: (id: string) => void
}) {
  const { t } = useT()
  const [open, setOpen] = useState(highlight)

  const seed = wish.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), index * 17)
  const left = 4 + (seed % 88)
  const duration = 22 + (seed % 14)
  const delay = highlight ? 0 : -((seed * 7) % duration)
  const size = highlight ? 64 : 36 + (seed % 22)
  const glow = LANTERN_COLORS[wish.color].glow

  return (
    <div
      className="animate-rise absolute bottom-0 will-change-transform"
      data-highlight={highlight || undefined}
      style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <div
        className={cn('animate-sway relative', highlight && 'animate-pop')}
        style={{ animationDelay: `${(seed % 5) * 0.4}s` }}
      >
        {highlight && (
          <span
            aria-hidden
            className="animate-land-glow pointer-events-none absolute inset-0 m-auto size-10 rounded-full"
          />
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto block cursor-pointer transition hover:scale-110"
          aria-label={wish.text}
        >
          <LanternIcon
            color={wish.color}
            style={{
              width: size,
              height: size * 1.56,
              filter: highlight
                ? `drop-shadow(0 0 18px ${glow}) drop-shadow(0 0 40px ${glow})`
                : undefined,
            }}
          />
        </button>
        <div
          className={cn(
            'bg-night-950/85 text-cream pointer-events-auto absolute top-1/2 left-full ml-2 w-44 -translate-y-1/2 rounded-2xl p-3 text-xs shadow-lg backdrop-blur transition-opacity',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <p className="leading-snug">{wish.text}</p>
          <div className="text-cream/50 mt-2 flex items-center justify-between text-[10px]">
            <span>— {wish.name || t('wishes.anonymous')}</span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(wish.id)}
                aria-label={t('wishes.remove')}
                className="hover:text-lantern-400 rounded p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
