import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn, LogOut, Trophy, UserRound } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { useAuth } from './useAuth'

export function UserMenu({ className }: { className?: string }) {
  const { t } = useT()
  const { status, user, player, signIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (status === 'loading') return <div className={cn('glass size-10 animate-pulse rounded-full', className)} aria-hidden />

  if (status === 'anonymous') {
    return (
      <button
        onClick={() => void signIn()}
        className={cn(
          'glass inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-cream/85 transition hover:border-gold-400/50 hover:text-gold-300',
          className,
        )}
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">{t('auth.signIn')}</span>
      </button>
    )
  }

  const label = player?.nickname ?? user?.name ?? '?'
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('auth.account')}
        className="glass inline-flex h-10 max-w-44 items-center gap-2 rounded-full pr-3 pl-1 text-sm font-semibold text-cream/90 transition hover:border-gold-400/50"
      >
        {user?.image ? (
          <img src={user.image} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full object-cover" />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-gold-500 text-night-950">
            {label.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="truncate">{label}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="glass absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl bg-night-800/95 p-1.5 text-sm shadow-lg"
        >
          <Link role="menuitem" to="/me" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/10">
            <UserRound className="size-4" /> {t('auth.profile')}
          </Link>
          <Link role="menuitem" to="/leaderboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/10">
            <Trophy className="size-4" /> {t('nav.leaderboard')}
          </Link>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void signOut()
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-lantern-300 hover:bg-white/10"
          >
            <LogOut className="size-4" /> {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
