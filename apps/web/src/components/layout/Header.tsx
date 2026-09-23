import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { LanguageToggle } from '@/components/LanguageToggle'
import { MusicToggle } from '@/components/MusicToggle'
import { MobileNav } from './MobileNav'
import { NAV_LINKS } from './navLinks'

export function Header() {
  const { t } = useT()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6">
      <div className="glass mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full px-3 pr-2 sm:px-5">
        <Link
          to="/"
          className="font-display text-moon-500 flex items-center gap-2.5 text-lg sm:text-xl"
        >
          <span className="shadow-gold-sm size-6 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffbe9,#ffd166_70%,#e0a52a)]" />
          <span className="text-glow">{t('common.appName')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-gold-500/15 text-gold-300'
                    : 'text-cream/75 hover:text-cream hover:bg-white/5',
                )
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <MusicToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label={t('common.menu')}
            className="glass text-cream/80 inline-flex size-10 items-center justify-center rounded-full md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      <MobileNav open={open} onClose={() => setOpen(false)} />
    </header>
  )
}
