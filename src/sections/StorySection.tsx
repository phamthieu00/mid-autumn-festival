import { useState } from 'react'
import { motion } from 'motion/react'
import { useT } from '@/i18n'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

type StoryId = 'cuoi' | 'hangNga' | 'thoNgoc'

const STORIES: { id: StoryId; emoji: string; gradient: string }[] = [
  { id: 'cuoi', emoji: '🌳', gradient: 'from-jade/30 to-night-700' },
  { id: 'hangNga', emoji: '👘', gradient: 'from-blush/30 to-night-700' },
  { id: 'thoNgoc', emoji: '🐇', gradient: 'from-moon-300/30 to-night-700' },
]

export function StorySection() {
  const { t } = useT()
  const [open, setOpen] = useState<StoryId | null>(null)

  return (
    <section id="story" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow={t('nav.story')}
        title={t('home.story.title')}
        subtitle={t('home.story.subtitle')}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        {STORIES.map((s, i) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: i * 0.1 }}
            className="glass group flex flex-col overflow-hidden rounded-3xl"
          >
            <div
              className={`flex h-40 items-center justify-center bg-gradient-to-b ${s.gradient} text-6xl transition-transform duration-500 group-hover:scale-105`}
            >
              <span className="animate-float drop-shadow-[0_0_18px_rgba(255,209,102,0.5)]">
                {s.emoji}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-moon-500 text-2xl">
                {t(`home.story.${s.id}.title`)}
              </h3>
              <p className="text-cream/70 mt-2 flex-1 text-sm">{t(`home.story.${s.id}.summary`)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold-300 mt-4 self-start px-0"
                onClick={() => setOpen(s.id)}
              >
                {t('common.readMore')} →
              </Button>
            </div>
          </motion.article>
        ))}
      </div>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? t(`home.story.${open}.title`) : ''}
      >
        {open && (
          <p className="text-cream/85 text-base leading-relaxed whitespace-pre-line">
            {t(`home.story.${open}.full`)}
          </p>
        )}
      </Modal>
    </section>
  )
}
