import { useT } from '@/i18n'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WishForm } from '@/features/wishes/WishForm'
import { WishesWall } from '@/features/wishes/WishesWall'

export function WishesSection({ compact = true }: { compact?: boolean }) {
  const { t } = useT()
  return (
    <section id="wishes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading eyebrow={t('nav.wishes')} title={t('wishes.title')} subtitle={t('wishes.subtitle')} />
      <div className={compact ? 'grid gap-6 lg:grid-cols-[1fr_1.2fr]' : 'space-y-6'}>
        <WishForm />
        <WishesWall compact={compact} />
      </div>
    </section>
  )
}
