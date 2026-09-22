import { useT } from '@/i18n'

export function PageSpinner() {
  const { t } = useT()
  return (
    <div className="text-cream/70 flex min-h-[60dvh] flex-col items-center justify-center gap-4">
      <div className="border-gold-400/30 border-t-gold-400 size-10 animate-spin rounded-full border-4" />
      <p className="text-sm">{t('common.loading')}</p>
    </div>
  )
}
