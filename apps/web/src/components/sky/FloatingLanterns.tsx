import { LanternIcon, type LanternColor } from '@/components/ui/LanternIcon'

const LANTERNS: {
  left: string
  delay: number
  duration: number
  size: number
  color: LanternColor
}[] = [
  { left: '6%', delay: 0, duration: 22, size: 34, color: 'red' },
  { left: '18%', delay: -7, duration: 26, size: 26, color: 'orange' },
  { left: '31%', delay: -14, duration: 24, size: 40, color: 'gold' },
  { left: '47%', delay: -3, duration: 28, size: 22, color: 'red' },
  { left: '62%', delay: -18, duration: 23, size: 30, color: 'pink' },
  { left: '74%', delay: -10, duration: 27, size: 36, color: 'orange' },
  { left: '87%', delay: -21, duration: 25, size: 28, color: 'red' },
  { left: '94%', delay: -5, duration: 30, size: 20, color: 'gold' },
]

export function FloatingLanterns() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {LANTERNS.map((l, i) => (
        <div
          key={i}
          className="animate-rise absolute bottom-0 will-change-transform"
          style={{
            left: l.left,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
          }}
        >
          <div className="animate-sway" style={{ animationDelay: `${i * 0.7}s` }}>
            <LanternIcon
              color={l.color}
              style={{ width: l.size, height: l.size * 1.56, opacity: 0.85 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
