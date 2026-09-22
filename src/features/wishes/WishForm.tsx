import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { LANTERN_COLORS, type LanternColor } from '@/components/ui/lanternColors'
import { useToast } from '@/components/ui/Toast'
import { useAudio } from '@/hooks/useAudio'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { wishesStore } from './wishesStore'
import { WISH_NAME_MAX, WISH_TEXT_MAX, type Wish } from './types'

const COLORS = Object.keys(LANTERN_COLORS) as LanternColor[]

export function WishForm({ onReleased }: { onReleased?: (wish: Wish) => void }) {
  const { t } = useT()
  const { toast } = useToast()
  const { playSfx } = useAudio()
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState<LanternColor>('red')

  const remaining = WISH_TEXT_MAX - text.length

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const res = wishesStore.add({ text, name, color })
    if (!res.ok) {
      if (res.reason === 'tooLong') toast(t('wishes.tooLong', { max: WISH_TEXT_MAX }), 'warn')
      return
    }
    playSfx('pop')
    setText('')
    toast(res.persisted ? t('wishes.saved') : t('wishes.storageWarn'), res.persisted ? 'success' : 'warn')
    onReleased?.(res.wish)
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-3xl p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="hidden shrink-0 sm:block">
          <LanternIcon color={color} className="animate-float h-24 w-16" />
        </div>
        <div className="flex-1 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, WISH_NAME_MAX))}
            placeholder={t('wishes.namePlaceholder')}
            maxLength={WISH_NAME_MAX}
            className="w-full rounded-2xl border border-white/10 bg-night-950/40 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold-400/60"
          />
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, WISH_TEXT_MAX))}
              placeholder={t('wishes.placeholder')}
              rows={3}
              maxLength={WISH_TEXT_MAX}
              required
              className="w-full resize-none rounded-2xl border border-white/10 bg-night-950/40 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold-400/60"
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
                color === c ? 'scale-110 border-cream' : 'border-transparent opacity-70 hover:opacity-100',
              )}
              style={{ background: LANTERN_COLORS[c].body, boxShadow: `0 0 12px ${LANTERN_COLORS[c].glow}` }}
            />
          ))}
        </div>
        <Button type="submit" disabled={!text.trim()}>
          <Send className="size-4" />
          {t('wishes.send')}
        </Button>
      </div>
    </form>
  )
}
