import { motion } from 'motion/react'
import { useT } from '@/i18n'
import { SectionHeading } from '@/components/ui/SectionHeading'

const ITEMS = [
  { id: 'mooncake', emoji: '🥮', accent: 'text-gold-400' },
  { id: 'starLantern', emoji: '⭐', accent: 'text-lantern-400' },
  { id: 'lionDance', emoji: '🦁', accent: 'text-lantern-600' },
  { id: 'parade', emoji: '🏮', accent: 'text-blush' },
] as const

export function TraditionsSection() {
  const { t } = useT()
  return (
    <section id="traditions" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow={t('nav.traditions')}
        title={t('home.traditions.title')}
        subtitle={t('home.traditions.subtitle')}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass rounded-3xl p-6"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-night-950/50 text-3xl shadow-inner">
              {item.emoji}
            </div>
            <h3 className={`font-display text-xl ${item.accent}`}>{t(`home.traditions.${item.id}.title`)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">{t(`home.traditions.${item.id}.desc`)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
