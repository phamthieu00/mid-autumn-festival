import { useT } from '@/i18n'
import { SEO } from '@/components/SEO'
import { SectionHeading } from '@/components/ui/SectionHeading'

export default function PrivacyPage() {
  const { t } = useT()
  const items = ['collect', 'purpose', 'cookies', 'retention', 'rights', 'contact'] as const
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SEO title={t('privacy.title')} />
      <SectionHeading title={t('privacy.title')} subtitle={t('privacy.subtitle')} />
      <div className="glass text-cream/85 space-y-6 rounded-3xl p-6 sm:p-8">
        {items.map((k) => (
          <section key={k}>
            <h2 className="text-gold-300 mb-1 font-semibold">{t(`privacy.${k}Title`)}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">{t(`privacy.${k}Body`)}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
