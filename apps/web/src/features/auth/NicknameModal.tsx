import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { LANTERN_COLOR_IDS, type LanternColor } from '@maf/shared/wishes'
import { NICKNAME_MAX, NICKNAME_MIN } from '@maf/shared/schemas'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { LANTERN_COLORS } from '@/components/ui/lanternColors'
import { useT } from '@/i18n'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useAuth } from './useAuth'

export function NicknameModal() {
  const { t } = useT()
  const { status, needsNickname, user, refresh } = useAuth()
  const [nickname, setNickname] = useState(() => (user?.name ?? '').slice(0, NICKNAME_MAX))
  const [color, setColor] = useState<LanternColor>('red')
  const [error, setError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: () => api('/me', { method: 'PATCH', body: { nickname, color } }),
    onSuccess: () => void refresh(),
    onError: (err) => {
      if (err instanceof ApiError && err.code === 'NICKNAME_TAKEN') setError(t('auth.nicknameTaken'))
      else if (err instanceof ApiError && err.code === 'NICKNAME_RESERVED') setError(t('auth.nicknameReserved'))
      else setError(t('auth.nicknameInvalid'))
    },
  })

  const open = status === 'authenticated' && needsNickname
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    save.mutate()
  }

  return (
    <Modal open={open} onClose={() => {}} dismissible={false} title={t('auth.pickNickname')}>
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-cream/70">{t('auth.pickNicknameHint')}</p>
        <div className="flex items-center gap-4">
          <LanternIcon color={color} className="h-20 w-14 shrink-0" />
          <div className="flex-1">
            <input
              autoFocus
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX))}
              minLength={NICKNAME_MIN}
              maxLength={NICKNAME_MAX}
              placeholder={t('auth.nicknamePlaceholder')}
              className="w-full rounded-2xl border border-white/10 bg-night-950/40 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold-400/60"
            />
            <p className="mt-1 text-xs text-cream/50">
              {NICKNAME_MIN}–{NICKNAME_MAX} {t('auth.characters')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2" role="radiogroup" aria-label={t('wishes.color')}>
          {LANTERN_COLOR_IDS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={t(`wishes.colors.${c}`)}
              onClick={() => setColor(c)}
              className={cn('size-8 rounded-full border-2 transition', color === c ? 'scale-110 border-cream' : 'border-transparent opacity-70')}
              style={{ background: LANTERN_COLORS[c].body, boxShadow: `0 0 12px ${LANTERN_COLORS[c].glow}` }}
            />
          ))}
        </div>
        {error && <p className="text-sm text-lantern-300">{error}</p>}
        <Button type="submit" className="w-full" disabled={nickname.trim().length < NICKNAME_MIN || save.isPending}>
          {t('auth.saveNickname')}
        </Button>
      </form>
    </Modal>
  )
}
