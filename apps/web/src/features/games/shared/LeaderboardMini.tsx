import { useQuery } from '@tanstack/react-query'
import type { LeaderboardPeriod, LeaderboardResponse } from '@maf/shared/api'
import type { GameId } from '@maf/shared/games/ids'
import { api } from '@/lib/api'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { useAuth } from '@/features/auth/useAuth'
import { LanternIcon } from '@/components/ui/LanternIcon'
import type { LanternColor } from '@maf/shared/wishes'

export const leaderboardQueryKey = (gameId: GameId, period: LeaderboardPeriod, limit: number) =>
  ['leaderboard', gameId, period, limit] as const

export function LeaderboardMini({
  gameId,
  period = 'weekly',
  unit,
}: {
  gameId: GameId
  period?: LeaderboardPeriod
  unit: string
}) {
  const { t } = useT()
  const { user } = useAuth()
  const q = useQuery({
    queryKey: leaderboardQueryKey(gameId, period, 5),
    queryFn: () => api<LeaderboardResponse>(`/leaderboards/${gameId}?period=${period}&limit=5`),
  })
  if (q.isPending) return <div className="glass h-28 animate-pulse rounded-2xl" />
  if (q.isError || !q.data) return null
  const rows = [...q.data.entries]
  if (q.data.me && !rows.some((e) => e.userId === q.data!.me!.userId)) rows.push(q.data.me)
  if (rows.length === 0) return <p className="text-cream/50 text-sm">{t('leaderboard.empty')}</p>
  return (
    <div className="glass rounded-2xl p-3 text-left text-sm">
      <p className="text-lantern-400 mb-2 text-xs font-semibold tracking-widest uppercase">
        {t(`leaderboard.${period}`)}
      </p>
      <ol className="space-y-1">
        {rows.map((e) => {
          const me = e.userId === user?.id
          return (
            <li
              key={e.userId}
              className={cn(
                'flex items-center gap-2 rounded-xl px-2 py-1',
                me && 'bg-gold-500/15 text-gold-300',
              )}
            >
              <span className="w-7 text-right font-bold tabular-nums">
                {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : `#${e.rank}`}
              </span>
              <LanternIcon color={e.color as LanternColor} glow={false} className="h-5 w-3.5" />
              <span className="flex-1 truncate">
                {e.nickname ?? t('wishes.anonymous')}
                {me ? ` (${t('leaderboard.you')})` : ''}
              </span>
              <span className="font-bold tabular-nums">{e.value}</span>
              <span className="text-cream/50 text-xs">{unit}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
