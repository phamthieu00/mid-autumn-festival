import { cn } from '@/lib/cn'

export function Moon({ className, size = 'lg' }: { className?: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'size-40 sm:size-56 lg:size-72' : 'size-16'
  return (
    <div className={cn('relative', dim, className)} aria-hidden>
      <div className="animate-glow absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_35%,#fffbe9_0%,#ffe9a8_40%,#ffd166_75%,#e0a52a_100%)] shadow-moon" />
      <div className="absolute top-[28%] left-[30%] size-[14%] rounded-full bg-gold-600/25" />
      <div className="absolute top-[55%] left-[58%] size-[18%] rounded-full bg-gold-600/20" />
      <div className="absolute top-[62%] left-[30%] size-[9%] rounded-full bg-gold-600/25" />
      <div className="absolute top-[22%] left-[62%] size-[7%] rounded-full bg-gold-600/20" />
    </div>
  )
}
