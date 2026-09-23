import { useEffect, useState } from 'react'
import { useT } from '@/i18n'
import { useAudio } from '@/hooks/useAudio'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WishForm } from '@/features/wishes/WishForm'
import { WishesWall } from '@/features/wishes/WishesWall'
import { LanternRelease } from '@/features/wishes/LanternRelease'
import { useLanternRelease } from '@/features/wishes/useLanternRelease'
import { useWishes } from '@/features/wishes/useWishes'

export function WishesSection({ compact = true }: { compact?: boolean }) {
  const { t } = useT()
  const { toast } = useToast()
  const { playSfx } = useAudio()
  const { releasing, highlightId, release, finish } = useLanternRelease()
  const { wishes, pending, total, offline, lastLiveId } = useWishes()
  const [expiredLiveId, setExpiredLiveId] = useState<string | null>(null)
  const liveHighlight = lastLiveId && lastLiveId !== expiredLiveId ? lastLiveId : null

  // someone else's lantern just arrived: drop the highlight after a few seconds
  useEffect(() => {
    if (!lastLiveId) return
    const id = window.setTimeout(() => setExpiredLiveId(lastLiveId), 3500)
    return () => window.clearTimeout(id)
  }, [lastLiveId])

  const onDone = () => {
    finish()
    playSfx('pop')
    toast(t('wishes.landed'), 'success')
  }

  const report = async (id: string) => {
    try {
      await api(`/wishes/${id}/report`, { method: 'POST', body: {} })
      toast(t('wishes.reported'), 'success')
    } catch {
      toast(t('auth.offline'), 'warn')
    }
  }

  return (
    <section id="wishes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow={t('nav.wishes')}
        title={t('wishes.title')}
        subtitle={t('wishes.subtitle')}
      />
      {offline && (
        <p className="text-cream/60 mb-4 text-center text-sm">{t('wishes.offlineNotice')}</p>
      )}
      <div className={compact ? 'grid gap-6 lg:grid-cols-[1fr_1.2fr]' : 'space-y-6'}>
        <WishForm onReleased={release} disabled={releasing !== null} />
        <WishesWall
          wishes={wishes}
          pending={pending}
          total={total}
          compact={compact}
          hideId={releasing?.wish.id ?? null}
          highlightId={highlightId ?? liveHighlight}
          onReport={offline ? undefined : (id) => void report(id)}
        />
      </div>
      {releasing && (
        <LanternRelease wish={releasing.wish} origin={releasing.origin} onDone={onDone} />
      )}
    </section>
  )
}
