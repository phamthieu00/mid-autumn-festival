import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { PlayerProfile } from '@maf/shared/api'
import { BADGES } from '@maf/shared/badges'
import { LANTERN_COLOR_IDS, type LanternColor } from '@maf/shared/wishes'
import { NICKNAME_MAX, NICKNAME_MIN } from '@maf/shared/schemas'
import { useT } from '@/i18n'
import { api, API_BASE, ApiError } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/format'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { LANTERN_COLORS } from '@/components/ui/lanternColors'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/useAuth'
import { GAMES } from '@/features/games/shared/registry'
import { useHighScores } from '@/features/scores/useHighScores'

export default function ProfilePage() {
  const { t, tx, lang } = useT()
  const { id } = useParams()
  const { status, user, player, signIn, refresh } = useAuth()
  const targetId = id ?? user?.id ?? null
  const own = !id || id === user?.id

  const q = useQuery({
    queryKey: ['player', targetId],
    queryFn: () => api<PlayerProfile>(`/players/${targetId}`),
    enabled: !!targetId,
  })

  if (!id && status === 'anonymous') {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-cream/70">{t('profile.loginPrompt')}</p>
        <Button onClick={() => void signIn()}>{t('auth.signIn')}</Button>
      </div>
    )
  }
  if (q.isPending || (!id && status === 'loading'))
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="glass h-64 animate-pulse rounded-3xl" />
      </div>
    )
  if (q.isError || !q.data)
    return <p className="text-cream/60 p-16 text-center">{t('profile.notFound')}</p>
  const p = q.data
  const earned = new Map(p.badges.map((b) => [b.badgeId, b.earnedAt]))
  const joined = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
    dateStyle: 'medium',
  }).format(new Date(p.createdAt))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SEO title={p.nickname ?? t('auth.profile')} />
      <header className="glass flex flex-col items-center gap-4 rounded-3xl p-6 text-center sm:flex-row sm:text-left">
        <LanternIcon color={p.color as LanternColor} className="h-24 w-16 shrink-0" />
        <div className="flex-1">
          <h1 className="font-display text-glow text-moon-500 text-4xl">
            {p.nickname ?? t('wishes.anonymous')}
          </h1>
          <p className="text-cream/60 mt-1 text-sm">
            {t('profile.joined')} {joined} · {t('profile.games', { count: p.totalGames })}
          </p>
        </div>
        {own && (
          <EditProfile
            nickname={player?.nickname ?? ''}
            color={(player?.color ?? 'red') as LanternColor}
            onSaved={refresh}
          />
        )}
      </header>

      <h2 className="font-display text-moon-500 mt-10 mb-4 text-2xl">{t('profile.bests')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((g) => {
          const b = p.bests.find((x) => x.gameId === g.id)
          return (
            <Link
              key={g.id}
              to={`/leaderboard?game=${g.id}&period=alltime`}
              className="glass hover:border-gold-400/50 flex items-center gap-3 rounded-2xl p-4 transition"
            >
              <span className="text-3xl">{g.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold">{t(g.titleKey)}</p>
                {b?.value != null ? (
                  <p className="text-cream/70 text-sm">
                    <span className="text-gold-300 font-bold">{b.value}</span> {t(g.unitKey)}
                    {b.secondary ? ` · ${formatTime(b.secondary)}` : ''}
                    {b.rank ? ` · #${b.rank}` : ''}
                  </p>
                ) : (
                  <p className="text-cream/40 text-sm">{t('common.noRecord')}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <h2 className="font-display text-moon-500 mt-10 mb-4 text-2xl">
        {t('profile.badges')}{' '}
        <span className="text-cream/50 text-base">
          {p.badges.length}/{BADGES.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGES.map((b) => {
          const at = earned.get(b.id)
          return (
            <div
              key={b.id}
              className={cn(
                'glass rounded-2xl p-4 text-center transition',
                !at && 'opacity-40 grayscale',
              )}
              title={at ? new Date(at).toLocaleDateString() : undefined}
            >
              <div className="text-3xl">{b.emoji}</div>
              <p className="text-gold-300 mt-1 text-sm font-bold">{tx(b.title)}</p>
              <p className="text-cream/60 mt-0.5 text-xs">{tx(b.desc)}</p>
            </div>
          )
        })}
      </div>

      {own && <LocalBests />}
      {own && <DangerZone />}
    </div>
  )
}

function EditProfile({
  nickname,
  color,
  onSaved,
}: {
  nickname: string
  color: LanternColor
  onSaved: () => Promise<void>
}) {
  const { t } = useT()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(nickname)
  const [c, setC] = useState<LanternColor>(color)
  const save = useMutation({
    mutationFn: () => api('/me', { method: 'PATCH', body: { nickname: name, color: c } }),
    onSuccess: async () => {
      await onSaved()
      setOpen(false)
      toast(t('profile.saved'), 'success')
    },
    onError: (err) =>
      toast(
        err instanceof ApiError && err.code === 'NICKNAME_TAKEN'
          ? t('auth.nicknameTaken')
          : t('auth.nicknameInvalid'),
        'warn',
      ),
  })
  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {t('profile.edit')}
      </Button>
    )
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate()
      }}
      className="flex w-full flex-col gap-3 sm:w-64"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, NICKNAME_MAX))}
        minLength={NICKNAME_MIN}
        className="bg-night-950/40 text-cream focus:border-gold-400/60 w-full rounded-2xl border border-white/10 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        {LANTERN_COLOR_IDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-label={t(`wishes.colors.${k}`)}
            onClick={() => setC(k)}
            className={cn(
              'size-7 rounded-full border-2',
              c === k ? 'border-cream' : 'border-transparent opacity-70',
            )}
            style={{ background: LANTERN_COLORS[k].body }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={save.isPending || name.trim().length < NICKNAME_MIN}
        >
          {t('auth.saveNickname')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t('common.close')}
        </Button>
      </div>
    </form>
  )
}

function DangerZone() {
  const { t, lang } = useT()
  const { toast } = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const del = useMutation({
    mutationFn: () => api<{ ok: boolean }>(`/me?lang=${lang}`, { method: 'DELETE' }),
    onSuccess: async () => {
      qc.clear()
      await refresh()
      toast(t('profile.deleted'), 'success')
      navigate('/')
    },
    onError: () => toast(t('auth.offline'), 'warn'),
  })
  return (
    <div className="mt-12 rounded-3xl border border-white/10 p-5">
      <h2 className="text-cream/80 mb-1 text-sm font-semibold">{t('profile.dataTitle')}</h2>
      <p className="text-cream/50 mb-4 text-xs">{t('profile.dataHint')}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={`${API_BASE}/me/export`}
          download
          className="glass text-cream/85 hover:text-gold-300 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
        >
          {t('profile.export')}
        </a>
        <Button
          variant="danger"
          size="sm"
          disabled={del.isPending}
          onClick={() => {
            if (window.confirm(t('profile.deleteConfirm'))) del.mutate()
          }}
        >
          {t('profile.delete')}
        </Button>
      </div>
    </div>
  )
}

function LocalBests() {
  const { t } = useT()
  const scores = useHighScores()
  const entries = GAMES.filter((g) => scores[g.id])
  if (entries.length === 0) return null
  return (
    <div className="mt-10">
      <h2 className="font-display text-moon-500 mb-2 text-2xl">{t('profile.localBests')}</h2>
      <p className="text-cream/50 mb-3 text-sm">{t('profile.localBestsHint')}</p>
      <div className="flex flex-wrap gap-2">
        {entries.map((g) => (
          <Badge key={g.id}>
            {g.emoji} {t(g.titleKey)}: {scores[g.id]!.value} {t(g.unitKey)}
          </Badge>
        ))}
      </div>
    </div>
  )
}
