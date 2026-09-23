import { cn } from '@/lib/cn'

export function Moon({ className, size = 'lg' }: { className?: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'size-40 sm:size-56 lg:size-72' : 'size-16'
  return (
    <div className={cn('relative', dim, className)} aria-hidden>
      <div className="animate-glow shadow-moon absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_35%,#fffbe9_0%,#ffe9a8_40%,#ffd166_75%,#e0a52a_100%)]" />
      <div className="bg-gold-600/25 absolute top-[28%] left-[30%] size-[14%] rounded-full" />
      <div className="bg-gold-600/20 absolute top-[55%] left-[58%] size-[18%] rounded-full" />
      <div className="bg-gold-600/25 absolute top-[62%] left-[30%] size-[9%] rounded-full" />
      <div className="bg-gold-600/20 absolute top-[22%] left-[62%] size-[7%] rounded-full" />
    </div>
  )
}
