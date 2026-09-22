import { useT } from '@/i18n'
import { SEO } from '@/components/SEO'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GameCard } from '@/features/games/shared/GameCard'
import { GAMES } from '@/features/games/shared/registry'

export default function GamesHubPage() {
  const { t } = useT()
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SEO title={t('games.hub.title')} />
      <SectionHeading
        eyebrow={t('nav.games')}
        title={t('games.hub.title')}
        subtitle={t('games.hub.subtitle')}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <GameCard key={g.id} game={g} index={i} showBest />
        ))}
      </div>
    </div>
  )
}
