import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Check } from 'lucide-react'
import type { DailyResponse } from '@maf/shared/api'
import { useT } from '@/i18n'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { pad2 } from '@/lib/format'
import { useCountdown } from '@/hooks/useCountdown'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { GAMES } from '@/features/games/shared/registry'

export const dailyQueryKey = ['daily'] as const

export function DailySection({ compact = false }: { compact?: boolean }) {
  const { t } = useT()
  const { status, signIn } = useAuth()
  const q = useQuery({
    queryKey: dailyQueryKey,
    queryFn: () => api<DailyResponse>('/daily'),
    refetchInterval: 60_000,
  })
  const resetsAt = q.data ? new Date(q.data.resetsAt) : null
  const left = useCountdown(resetsAt)
  if (q.isError) return null

  const done = q.data?.challenges.filter((c) => c.done).length ?? 0
  return (
    <section
      id="daily"
      className={cn('mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6', compact ? 'py-6' : 'py-20')}
    >
      {!compact && (
        <SectionHeading
          eyebrow={t('daily.eyebrow')}
          title={t('daily.title')}
          subtitle={t('daily.subtitle')}
        />
      )}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-lantern-400 flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="size-4" />
            {compact ? t('daily.title') : q.data?.dailyKey}
            {status === 'authenticated' && q.data && (
              <span className="bg-jade/15 text-jade rounded-full px-2 py-0.5 text-xs">
                {t('daily.progress', { done, total: q.data.challenges.length })}
              </span>
            )}
          </div>
          {resetsAt && (
            <p className="text-cream/60 text-xs tabular-nums">
              {t('daily.resetsIn')} {pad2(left.hours)}:{pad2(left.minutes)}:{pad2(left.seconds)}
            </p>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {GAMES.map((g) => {
            const c = q.data?.challenges.find((x) => x.gameId === g.id)
            return (
              <Link
                key={g.id}
                to={`${g.path}?mode=daily`}
                className={cn(
                  'group flex flex-col items-center gap-1 rounded-2xl border p-3 text-center text-xs transition hover:-translate-y-0.5',
                  c?.done
                    ? 'border-jade/40 bg-jade/10'
                    : 'hover:border-gold-400/50 border-white/10 bg-white/5',
                )}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-cream/90 font-semibold">{t(g.titleKey)}</span>
                {c?.done ? (
                  <span className="text-jade inline-flex items-center gap-1">
                    <Check className="size-3" /> {c.myValue} {c.myRank ? `· #${c.myRank}` : ''}
                  </span>
                ) : (
                  <span className="text-cream/50">{q.isPending ? '…' : t('daily.play')}</span>
                )}
              </Link>
            )
          })}
        </div>
        {status === 'anonymous' && (
          <div className="text-cream/60 mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            {t('daily.loginHint')}
            <Button size="sm" variant="secondary" onClick={() => void signIn()}>
              {t('auth.signIn')}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
