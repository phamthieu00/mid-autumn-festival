import { useT } from '@/i18n'

export function Footer() {
  const { t } = useT()
  return (
    <footer className="relative z-10 mt-24 px-4 pb-10 text-center text-sm text-cream/50">
      <p>{t('footer.madeWith')}</p>
      <p className="mt-1">{t('footer.credits')}</p>
      <p className="mt-1">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  )
}
