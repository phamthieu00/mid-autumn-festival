import { cn } from '@/lib/cn'

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-gold-300 to-gold-500 text-night-950 shadow-gold-sm hover:from-moon-300 hover:to-gold-400 hover:shadow-lantern active:scale-[0.98]',
  secondary: 'glass text-cream hover:border-gold-400/50 hover:bg-white/10 active:scale-[0.98]',
  ghost: 'text-cream/80 hover:bg-white/10 hover:text-cream',
  danger: 'bg-lantern-600 text-cream hover:bg-lantern-500 active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-base gap-2',
  lg: 'h-13 px-7 text-lg gap-2.5',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md') {
  return cn(
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  )
}
