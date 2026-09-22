import { useT } from '@/i18n'
import type { Lang } from '@/i18n'
import { cn } from '@/lib/cn'

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useT()
  const opts: Lang[] = ['vi', 'en']
  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn('glass inline-flex rounded-full p-1 text-xs font-bold', className)}
    >
      {opts.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'rounded-full px-3 py-1.5 uppercase transition',
            lang === l ? 'bg-gold-500 text-night-950 shadow-gold-sm' : 'text-cream/70 hover:text-cream',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
