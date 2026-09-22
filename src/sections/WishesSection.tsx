import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { useToast } from '@/components/ui/Toast'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WishForm } from '@/features/wishes/WishForm'
import { WishesWall } from '@/features/wishes/WishesWall'
import { LanternRelease } from '@/features/wishes/LanternRelease'
import { useLanternRelease } from '@/features/wishes/useLanternRelease'

export function WishesSection({ compact = true }: { compact?: boolean }) {
  const { t } = useT()
  const { toast } = useToast()
  const { playSfx } = useAudio()
  const { releasing, highlightId, release, finish } = useLanternRelease()

  const onDone = () => {
    finish()
    playSfx('pop')
    toast(t('wishes.landed'), 'success')
  }

  return (
    <section id="wishes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow={t('nav.wishes')}
        title={t('wishes.title')}
        subtitle={t('wishes.subtitle')}
      />
      <div className={compact ? 'grid gap-6 lg:grid-cols-[1fr_1.2fr]' : 'space-y-6'}>
        <WishForm onReleased={release} disabled={releasing !== null} />
        <WishesWall
          compact={compact}
          hideId={releasing?.wish.id ?? null}
          highlightId={highlightId}
        />
      </div>
      {releasing && (
        <LanternRelease wish={releasing.wish} origin={releasing.origin} onDone={onDone} />
      )}
    </section>
  )
}
