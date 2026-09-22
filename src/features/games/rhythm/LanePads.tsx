import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { LANE_COLORS, LANE_KEYS } from './constants'
import type { Lane } from './types'

const EMOJI = ['🥁', '🪘', '🎇']

export function LanePads({ onHit, disabled }: { onHit: (lane: Lane) => void; disabled: boolean }) {
  const { t } = useT()
  const labels = [t('games.rhythm.lane1'), t('games.rhythm.lane2'), t('games.rhythm.lane3')]
  return (
    <div className="grid grid-cols-3 gap-2 p-2 sm:gap-3 sm:p-3">
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault()
            onHit(i as Lane)
          }}
          aria-label={label}
          className={cn(
            'glass flex h-16 touch-none flex-col items-center justify-center rounded-2xl text-sm font-bold transition select-none active:scale-95 sm:h-20',
            disabled && 'opacity-60',
          )}
          style={{ borderColor: `${LANE_COLORS[i]}66`, color: LANE_COLORS[i] }}
        >
          <span className="text-xl leading-none">{EMOJI[i]}</span>
          <span className="mt-1 text-[11px] tracking-widest uppercase opacity-80">
            {LANE_KEYS[i].toUpperCase()} · {label}
          </span>
        </button>
      ))}
    </div>
  )
}
