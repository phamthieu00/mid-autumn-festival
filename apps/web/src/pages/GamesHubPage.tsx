import { useT } from '@/i18n'
import { SEO } from '@/components/SEO'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GameCard } from '@/features/games/shared/GameCard'
import { gamesByKind } from '@/features/games/shared/registry'
import { DailySection } from '@/features/daily/DailySection'

export default function GamesHubPage() {
  const { t } = useT()
  const action = gamesByKind('action')
  const brain = gamesByKind('brain')
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SEO title={t('games.hub.title')} />
      <SectionHeading
        eyebrow={t('nav.games')}
        title={t('games.hub.title')}
        subtitle={t('games.hub.subtitle')}
      />
      <div className="-mx-4 mb-10 sm:-mx-6">
        <DailySection compact />
      </div>
      <h3 className="text-lantern-400 mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
        {t('games.hub.groupAction')}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {action.map((g, i) => (
          <GameCard key={g.id} game={g} index={i} showBest />
        ))}
      </div>
      <h3 className="text-lantern-400 mt-12 mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
        {t('games.hub.groupBrain')}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {brain.map((g, i) => (
          <GameCard key={g.id} game={g} index={i} showBest />
        ))}
      </div>
    </div>
  )
}
