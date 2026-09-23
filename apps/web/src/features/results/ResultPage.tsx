import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ResultResponse } from '@maf/shared/api'
import type { LanternColor } from '@maf/shared/wishes'
import { useT } from '@/i18n'
import { api } from '@/lib/api'
import { formatTime } from '@/lib/format'
import { SEO } from '@/components/SEO'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { LinkButton } from '@/components/ui/LinkButton'
import { ShareButton } from '@/components/ShareButton'
import { gameById } from '@/features/games/shared/registry'

export default function ResultPage() {
  const { t, lang } = useT()
  const { id = '' } = useParams()
  const q = useQuery({
    queryKey: ['result', id],
    queryFn: () => api<ResultResponse>(`/results/${id}`),
    enabled: !!id,
  })

  if (q.isPending)
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="glass h-80 animate-pulse rounded-3xl" />
      </div>
    )
  if (q.isError || !q.data)
    return <p className="text-cream/60 p-16 text-center">{t('results.notFound')}</p>
  const r = q.data
  const game = gameById(r.gameId)
  const name = r.player?.nickname ?? t('wishes.anonymous')
  const date = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(r.createdAt))
  const shareUrl = `${window.location.origin}/r/${r.publicId}`

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <SEO title={`${name} · ${r.value} ${t(game.unitKey)}`} />
      <div className="glass rounded-3xl p-8 text-center">
        <div className="animate-float text-6xl">{game.emoji}</div>
        <h1 className="font-display text-glow text-moon-500 mt-3 text-3xl">{t(game.titleKey)}</h1>
        <div className="mt-6 flex items-center justify-center gap-3">
          <LanternIcon color={(r.player?.color ?? 'red') as LanternColor} className="h-14 w-9" />
          <div className="text-left">
            <p className="font-semibold">
              {r.player ? (
                <Link to={`/players/${r.player.userId}`} className="hover:underline">
                  {name}
                </Link>
              ) : (
                name
              )}
            </p>
            <p className="text-cream/50 text-xs">{date}</p>
          </div>
        </div>
        <p className="font-display text-glow text-gold-400 mt-6 text-7xl tabular-nums">
          {r.value} <span className="text-cream/70 text-2xl">{t(game.unitKey)}</span>
        </p>
        {r.secondary != null && r.secondary > 0 && (
          <p className="text-cream/60 text-sm">
            {t('common.time')}: {formatTime(r.secondary)}
          </p>
        )}
        {r.rank && (
          <p className="text-jade mt-2 font-semibold">
            {t('games.shared.rankAlltime', { rank: r.rank })}
          </p>
        )}
        {r.mode === 'daily' && r.dailyKey && (
          <p className="text-cream/50 mt-1 text-xs">
            {t('games.shared.modeDaily')} · {r.dailyKey}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton to={game.path} size="lg">
            {t('results.beatIt')}
          </LinkButton>
          <ShareButton
            size="lg"
            url={shareUrl}
            text={t('results.shareText', {
              name,
              score: `${r.value} ${t(game.unitKey)}`,
              game: t(game.titleKey),
            })}
          />
        </div>
      </div>
    </div>
  )
}
