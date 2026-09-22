import { useT } from '@/i18n'
import { LinkButton } from '@/components/ui/LinkButton'
import { Moon } from '@/components/sky/Moon'

export default function NotFoundPage() {
  const { t } = useT()
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <Moon size="sm" className="mb-8" />
      <h1 className="font-display text-glow text-moon-500 text-4xl">{t('notFound.title')}</h1>
      <p className="text-cream/70 mt-4">{t('notFound.desc')}</p>
      <LinkButton to="/" className="mt-8">
        {t('notFound.cta')}
      </LinkButton>
    </div>
  )
}
