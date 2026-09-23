import { useT } from '@/i18n'
import { SEO } from '@/components/SEO'
import { WishesSection } from '@/sections/WishesSection'

export default function WishesPage() {
  const { t } = useT()
  return (
    <div className="py-4">
      <SEO title={t('wishes.title')} />
      <WishesSection compact={false} />
    </div>
  )
}
