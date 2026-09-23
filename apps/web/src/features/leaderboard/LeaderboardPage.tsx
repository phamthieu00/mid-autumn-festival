import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { LeaderboardPeriod, LeaderboardResponse } from '@maf/shared/api'
import type { GameId } from '@maf/shared/games/ids'
import type { LanternColor } from '@maf/shared/wishes'
import { useT } from '@/i18n'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/format'
import { SEO } from '@/components/SEO'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LanternIcon } from '@/components/ui/LanternIcon'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { GAMES } from '@/features/games/shared/registry'
import { leaderboardQueryKey } from '@/features/games/shared/LeaderboardMini'

const PERIODS: LeaderboardPeriod[] = ['daily', 'weekly', 'alltime']
const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { t } = useT()
  const { status, user, signIn } = useAuth()
  const [params, setParams] = useSearchParams()
  const gameParam = params.get('game') as GameId | null
  const gameId: GameId = GAMES.some((g) => g.id === gameParam) ? gameParam! : 'catch'
  const periodParam = params.get('period') as LeaderboardPeriod | null
  const period: LeaderboardPeriod =
    periodParam && PERIODS.includes(periodParam) ? periodParam : 'weekly'
  const game = GAMES.find((g) => g.id === gameId)!

  const q = useQuery({
    queryKey: leaderboardQueryKey(gameId, period, 50),
    queryFn: () => api<LeaderboardResponse>(`/leaderboards/${gameId}?period=${period}&limit=50`),
    refetchInterval: 30_000,
  })
  const unit = t(game.unitKey)
  const set = (patch: Record<string, string>) => setParams({ game: gameId, period, ...patch })

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <SEO title={t('leaderboard.title')} />
      <SectionHeading
        eyebrow={t('nav.games')}
        title={t('leaderboard.title')}
        subtitle={t('leaderboard.subtitle')}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => set({ game: g.id })}
            aria-pressed={g.id === gameId}
            className={cn(
              'glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition',
              g.id === gameId
                ? 'border-gold-400/60 bg-gold-500/15 text-gold-300'
                : 'text-cream/75 hover:text-cream',
            )}
          >
            <span>{g.emoji}</span> {t(g.titleKey)}
          </button>
        ))}
      </div>

      <div
        role="radiogroup"
        className="glass mx-auto mt-5 flex w-fit rounded-full p-1 text-sm font-bold"
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            role="radio"
            aria-checked={p === period}
            onClick={() => set({ period: p })}
            className={cn(
              'rounded-full px-4 py-1.5 transition',
              p === period ? 'bg-gold-500 text-night-950' : 'text-cream/70 hover:text-cream',
            )}
          >
            {t(`leaderboard.${p}`)}
          </button>
        ))}
      </div>

      <div className="glass mt-8 overflow-hidden rounded-3xl">
        {q.isPending ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : q.isError ? (
          <p className="text-cream/60 p-8 text-center">{t('auth.offline')}</p>
        ) : q.data.entries.length === 0 ? (
          <p className="text-cream/60 p-10 text-center">{t('leaderboard.empty')}</p>
        ) : (
          <ol>
            {q.data.entries.map((e) => (
              <Row key={e.userId} e={e} unit={unit} me={e.userId === user?.id} />
            ))}
          </ol>
        )}
        {q.data?.me && !q.data.entries.some((e) => e.userId === q.data!.me!.userId) && (
          <div className="border-gold-400/20 bg-gold-500/10 border-t">
            <Row e={q.data.me} unit={unit} me />
          </div>
        )}
        {status === 'authenticated' && q.data && !q.data.me && (
          <p className="text-cream/50 border-t border-white/5 p-4 text-center text-sm">
            {t('leaderboard.notRanked')} ·{' '}
            <Link className="text-gold-300 underline" to={game.path}>
              {t('common.playNow')}
            </Link>
          </p>
        )}
        {status === 'anonymous' && (
          <div className="text-cream/60 flex flex-col items-center gap-3 border-t border-white/5 p-5 text-center text-sm">
            {t('leaderboard.loginHint')}
            <Button size="sm" variant="secondary" onClick={() => void signIn()}>
              {t('auth.signIn')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({
  e,
  unit,
  me,
}: {
  e: LeaderboardResponse['entries'][number]
  unit: string
  me: boolean
}) {
  const { t } = useT()
  return (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm',
        me && 'bg-gold-500/10 text-gold-300',
      )}
    >
      <span className="w-9 text-center text-base font-bold tabular-nums">
        {e.rank <= 3 ? MEDALS[e.rank - 1] : `#${e.rank}`}
      </span>
      <LanternIcon color={e.color as LanternColor} glow={false} className="h-7 w-5" />
      <Link to={`/players/${e.userId}`} className="flex-1 truncate font-semibold hover:underline">
        {e.nickname ?? t('wishes.anonymous')}
        {me && (
          <span className="ml-1 text-xs font-normal opacity-70">({t('leaderboard.you')})</span>
        )}
      </Link>
      {e.secondary != null && (
        <span className="text-cream/50 text-xs tabular-nums">{formatTime(e.secondary)}</span>
      )}
      <span className="font-bold tabular-nums">
        {e.value} <span className="text-cream/50 text-xs font-normal">{unit}</span>
      </span>
    </li>
  )
}
