import { useState } from 'react'
import { X } from 'lucide-react'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { useT } from '@/i18n'
import type { Wish } from './types'

export function WishLantern({
  wish,
  index,
  onRemove,
}: {
  wish: Wish
  index: number
  onRemove?: (id: string) => void
}) {
  const { t } = useT()
  const [open, setOpen] = useState(false)

  // deterministic pseudo-random layout from index/id
  const seed = wish.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), index * 17)
  const left = 4 + (seed % 88)
  const duration = 22 + (seed % 14)
  const delay = -((seed * 7) % duration)
  const size = 36 + (seed % 22)

  return (
    <div
      className="animate-rise absolute bottom-0 will-change-transform"
      style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <div className="animate-sway relative" style={{ animationDelay: `${(seed % 5) * 0.4}s` }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto block cursor-pointer transition hover:scale-110"
          aria-label={wish.text}
        >
          <LanternIcon color={wish.color} style={{ width: size, height: size * 1.56 }} />
        </button>
        <div
          className={
            'pointer-events-auto absolute top-1/2 left-full ml-2 w-44 -translate-y-1/2 rounded-2xl bg-night-950/85 p-3 text-xs text-cream shadow-lg backdrop-blur transition-opacity ' +
            (open ? 'opacity-100' : 'pointer-events-none opacity-0')
          }
        >
          <p className="leading-snug">{wish.text}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-cream/50">
            <span>— {wish.name || t('wishes.anonymous')}</span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(wish.id)}
                aria-label={t('wishes.remove')}
                className="rounded p-0.5 hover:text-lantern-400"
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
