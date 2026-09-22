import { useT } from '@/i18n'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LinkButton } from '@/components/ui/LinkButton'
import { GameCard } from '@/features/games/shared/GameCard'
import { GAMES } from '@/features/games/shared/registry'

export function GamesPreviewSection() {
  const { t } = useT()
  return (
    <section id="games" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow={t('nav.games')}
        title={t('home.gamesPreview.title')}
        subtitle={t('home.gamesPreview.subtitle')}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        {GAMES.map((g, i) => (
          <GameCard key={g.id} game={g} index={i} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <LinkButton to="/games" variant="secondary">
          {t('home.gamesPreview.viewAll')}
        </LinkButton>
      </div>
    </section>
  )
}
