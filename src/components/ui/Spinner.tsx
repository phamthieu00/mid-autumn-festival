import { useT } from '@/i18n'

export function PageSpinner() {
  const { t } = useT()
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-cream/70">
      <div className="size-10 animate-spin rounded-full border-4 border-gold-400/30 border-t-gold-400" />
      <p className="text-sm">{t('common.loading')}</p>
    </div>
  )
}
