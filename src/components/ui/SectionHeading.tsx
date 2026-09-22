import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = 'center',
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn('mb-10 space-y-3', align === 'center' ? 'text-center' : 'text-left', className)}
    >
      {eyebrow && (
        <p className="text-lantern-400 text-sm font-semibold tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-glow text-moon-500 text-4xl sm:text-5xl">{title}</h2>
      {subtitle && (
        <p className="text-cream/70 mx-auto max-w-2xl text-base sm:text-lg">{subtitle}</p>
      )}
    </div>
  )
}
