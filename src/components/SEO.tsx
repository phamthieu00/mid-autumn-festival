import { useT } from '@/i18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function SEO({ title }: { title?: string }) {
  const { t } = useT()
  const base = `${t('common.appName')} · ${t('common.tagline')}`
  useDocumentTitle(title ? `${title} · ${t('common.appName')}` : base)
  return null
}
