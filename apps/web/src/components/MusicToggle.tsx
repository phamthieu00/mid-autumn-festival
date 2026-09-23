import { VolumeX } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'

export function MusicToggle({ className }: { className?: string }) {
  const { musicOn, toggleMusic } = useAudio()
  const { t } = useT()
  return (
    <button
      onClick={toggleMusic}
      aria-pressed={musicOn}
      aria-label={musicOn ? t('common.musicOn') : t('common.musicOff')}
      title={musicOn ? t('common.musicOn') : t('common.musicOff')}
      className={cn(
        'glass text-cream/80 hover:text-gold-300 inline-flex size-10 items-center justify-center rounded-full transition',
        musicOn && 'border-gold-400/40 text-gold-400',
        className,
      )}
    >
      {musicOn ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 0.15, 0.3].map((delay, i) => (
            <span
              key={i}
              className="animate-eq bg-gold-400 w-[3px] origin-bottom rounded-sm"
              style={{
                height: 16,
                animationDelay: `${delay}s`,
                animationDuration: `${[0.9, 1.1, 0.8][i]}s`,
              }}
            />
          ))}
        </span>
      ) : (
        <VolumeX className="size-5" />
      )}
    </button>
  )
}
