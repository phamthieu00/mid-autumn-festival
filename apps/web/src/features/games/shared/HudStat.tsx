import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

export type HudAccent = 'gold' | 'lantern' | 'jade'

export function HudStat({
  icon: Icon,
  label,
  value,
  accent = 'gold',
  pulse = false,
  className,
}: {
  icon?: LucideIcon
  label?: ReactNode
  value: ReactNode
  accent?: HudAccent
  pulse?: boolean
  className?: string
}) {
  return (
    <Badge
      className={cn(
        'text-sm',
        accent === 'lantern' && 'border-lantern-500/40 bg-lantern-500/15 text-lantern-300',
        accent === 'jade' && 'border-jade/40 bg-jade/10 text-jade',
        pulse && 'animate-pop',
        className,
      )}
    >
      {Icon && <Icon className="size-4" />}
      {label != null && <span className="font-medium opacity-80">{label}:</span>}
      <strong className={cn('tabular-nums', accent === 'gold' && 'text-gold-300')}>{value}</strong>
    </Badge>
  )
}
