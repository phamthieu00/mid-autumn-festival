import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'border-gold-400/30 bg-gold-500/10 text-gold-300 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
      {...props}
    />
  )
}
