import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'

export function MusicToggle({ className }: { className?: string }) {
  const { musicOn, musicAvailable, toggleMusic } = useAudio()
  const { t } = useT()
  if (!musicAvailable) return null
  return (
    <button
      onClick={toggleMusic}
      aria-pressed={musicOn}
      aria-label={musicOn ? t('common.musicOn') : t('common.musicOff')}
      title={musicOn ? t('common.musicOn') : t('common.musicOff')}
      className={cn(
        'glass inline-flex size-10 items-center justify-center rounded-full text-cream/80 transition hover:text-gold-300',
        musicOn && 'text-gold-400',
        className,
      )}
    >
      {musicOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  )
}
