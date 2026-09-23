import { Link } from 'react-router-dom'
import { useT } from '@/i18n'

export function Footer() {
  const { t } = useT()
  return (
    <footer className="text-cream/50 relative z-10 mt-24 px-4 pb-10 text-center text-sm">
      <p>{t('footer.madeWith')}</p>
      {/* <p className="mt-1">{t('footer.credits')}</p> */}
      <p className="mt-1">
        {t('footer.copyright', { year: new Date().getFullYear() })} ·{' '}
        <Link to="/privacy" className="hover:text-cream">
          {t('privacy.title')}
        </Link>
      </p>
    </footer>
  )
}
