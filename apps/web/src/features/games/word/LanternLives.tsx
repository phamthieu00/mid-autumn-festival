import { LanternIcon } from '@/components/ui/LanternIcon'
import { cn } from '@/lib/cn'
import { MAX_WRONG } from '@maf/shared/games/word/wordReducer'

export function LanternLives({ wrong }: { wrong: number }) {
  return (
    <div className="flex items-end justify-center gap-1.5 sm:gap-2" aria-hidden>
      {Array.from({ length: MAX_WRONG }, (_, i) => {
        const lit = i >= wrong
        return (
          <LanternIcon
            key={i}
            color={i % 2 === 0 ? 'red' : 'orange'}
            glow={lit}
            className={cn(
              'h-10 w-7 transition-all duration-500 sm:h-12 sm:w-8',
              lit ? 'animate-float' : 'scale-90 opacity-25 grayscale',
            )}
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        )
      })}
    </div>
  )
}
