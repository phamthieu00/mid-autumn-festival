import { useRef, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import type { WishItem } from '@maf/shared/api'
import { Button } from '@/components/ui/Button'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { LANTERN_COLORS, type LanternColor } from '@/components/ui/lanternColors'
import { useToast } from '@/components/ui/Toast'
import { useAudio } from '@/hooks/useAudio'
import { useT } from '@/i18n'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useAuth } from '@/features/auth/useAuth'
import { prefetchLanternRelease } from './prefetchLanternRelease'
import { toWish, WISHES_QUERY_KEY } from './useWishes'
import { wishesStore } from './wishesStore'
import { WISH_NAME_MAX, WISH_TEXT_MAX, type Wish } from './types'

const COLORS = Object.keys(LANTERN_COLORS) as LanternColor[]

export function WishForm({
  onReleased,
  disabled = false,
}: {
  onReleased?: (wish: Wish, origin: { x: number; y: number }) => void
  disabled?: boolean
}) {
  const { t, lang } = useT()
  const { toast } = useToast()
  const { playSfx } = useAudio()
  const { player } = useAuth()
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState<LanternColor>(
    (player?.color as LanternColor | undefined) ?? 'red',
  )
  const [busy, setBusy] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)

  const remaining = WISH_TEXT_MAX - text.length

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (disabled || busy) return
    const trimmed = text.trim()
    if (!trimmed) return
    setBusy(true)
    const rect = submitRef.current?.getBoundingClientRect()
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight * 0.7 }
    try {
      const res = await api<{ wish: WishItem; newBadges: string[] }>('/wishes', {
        method: 'POST',
        body: { text: trimmed, name: name.trim() || undefined, color, lang },
      })
      playSfx('flip')
      setText('')
      if (res.wish.status === 'pending') toast(t('wishes.pendingNotice'), 'warn')
      void qc.invalidateQueries({ queryKey: WISHES_QUERY_KEY })
      onReleased?.(toWish(res.wish), origin)
    } catch (err) {
      const e = err as ApiError
      if (e.isNetwork || e.status >= 500) {
        const local = wishesStore.add({ text: trimmed, name: name.trim() || undefined, color })
        if (local.ok) {
          playSfx('flip')
          setText('')
          toast(t('wishes.storageWarn'), 'warn')
          onReleased?.(local.wish, origin)
        }
      } else if (e.code === 'INAPPROPRIATE') toast(t('wishes.blockedWords'), 'warn')
      else if (e.code === 'NO_LINKS') toast(t('wishes.noLinks'), 'warn')
      else if (e.code === 'RATE_LIMITED') toast(t('wishes.rateLimited'), 'warn')
      else toast(t('wishes.tooLong', { max: WISH_TEXT_MAX }), 'warn')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="glass space-y-4 rounded-3xl p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="hidden shrink-0 sm:block">
          <LanternIcon color={color} className="animate-float h-24 w-16" />
        </div>
        <div className="flex-1 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, WISH_NAME_MAX))}
            placeholder={player?.nickname ?? t('wishes.namePlaceholder')}
            maxLength={WISH_NAME_MAX}
            className="bg-night-950/40 text-cream placeholder:text-cream/40 focus:border-gold-400/60 w-full rounded-2xl border border-white/10 px-4 py-2.5 text-sm"
          />
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, WISH_TEXT_MAX))}
              onFocus={prefetchLanternRelease}
              placeholder={t('wishes.placeholder')}
              rows={3}
              maxLength={WISH_TEXT_MAX}
              required
              className="bg-night-950/40 text-cream placeholder:text-cream/40 focus:border-gold-400/60 w-full resize-none rounded-2xl border border-white/10 px-4 py-3"
            />
            <span
              className={cn(
                'absolute right-3 bottom-2 text-xs tabular-nums',
                remaining < 15 ? 'text-lantern-400' : 'text-cream/40',
              )}
            >
              {remaining}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="radiogroup" aria-label={t('wishes.color')}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={t(`wishes.colors.${c}`)}
              onClick={() => setColor(c)}
              className={cn(
                'size-8 rounded-full border-2 transition',
                color === c
                  ? 'border-cream scale-110'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
              style={{
                background: LANTERN_COLORS[c].body,
                boxShadow: `0 0 12px ${LANTERN_COLORS[c].glow}`,
              }}
            />
          ))}
        </div>
        <Button ref={submitRef} type="submit" disabled={!text.trim() || disabled || busy}>
          <Send className="size-4" />
          {disabled ? t('wishes.releasing') : t('wishes.send')}
        </Button>
      </div>
    </form>
  )
}
