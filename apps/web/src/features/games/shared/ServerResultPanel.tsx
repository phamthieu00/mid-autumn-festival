import { Trophy, WifiOff } from 'lucide-react'
import { badgeById } from '@maf/shared/badges'
import type { GameId } from '@maf/shared/games/ids'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { LeaderboardMini } from './LeaderboardMini'
import type { GameSession } from './useGameSession'

/** Shows the server-side outcome of a finished session inside GameOverModal. */
export function ServerResultPanel({
  session,
  gameId,
  unit,
}: {
  session: GameSession
  gameId: GameId
  unit: string
}) {
  const { t, tx } = useT()
  const { status, signIn } = useAuth()
  const { state, result } = session

  if (state === 'offline') {
    return (
      <p className="text-cream/60 mt-3 inline-flex items-center gap-2 text-sm">
        <WifiOff className="size-4" /> {t('auth.offline')}
      </p>
    )
  }
  if (!result) return null

  const rankBits: string[] = []
  if (result.ranks.daily) rankBits.push(t('games.shared.rankDaily', { rank: result.ranks.daily }))
  if (result.ranks.weekly)
    rankBits.push(t('games.shared.rankWeekly', { rank: result.ranks.weekly }))
  if (result.ranks.alltime)
    rankBits.push(t('games.shared.rankAlltime', { rank: result.ranks.alltime }))

  return (
    <div className="mt-4 space-y-3 text-center">
      {rankBits.length > 0 && (
        <p className="text-jade text-sm font-semibold">{rankBits.join(' · ')}</p>
      )}
      {result.anonymous && status !== 'authenticated' && (
        <Button variant="secondary" size="sm" onClick={() => void signIn()}>
          <Trophy className="size-4" /> {t('auth.loginToRank')}
        </Button>
      )}
      {result.newBadges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {result.newBadges.map((id) => {
            const b = badgeById(id)
            if (!b) return null
            return (
              <span
                key={id}
                className="animate-pop border-gold-400/40 bg-gold-500/15 text-gold-300 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold"
              >
                {b.emoji} {t('games.shared.newBadge')}: {tx(b.title)}
              </span>
            )
          })}
        </div>
      )}
      {!result.anonymous && (
        <LeaderboardMini
          gameId={gameId}
          period={result.mode === 'daily' ? 'daily' : 'weekly'}
          unit={unit}
        />
      )}
    </div>
  )
}
