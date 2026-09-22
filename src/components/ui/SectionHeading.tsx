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
    <div className={cn('mb-10 space-y-3', align === 'center' ? 'text-center' : 'text-left', className)}>
      {eyebrow && (
        <p className="text-sm font-semibold tracking-[0.2em] text-lantern-400 uppercase">{eyebrow}</p>
      )}
      <h2 className="font-display text-glow text-4xl text-moon-500 sm:text-5xl">{title}</h2>
      {subtitle && <p className="mx-auto max-w-2xl text-base text-cream/70 sm:text-lg">{subtitle}</p>}
    </div>
  )
}
