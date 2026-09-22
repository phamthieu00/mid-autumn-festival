import { AnimatePresence, motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { LanguageToggle } from '@/components/LanguageToggle'
import { NAV_LINKS } from './navLinks'

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.nav
            aria-label="Mobile"
            className="glass absolute inset-y-3 right-3 flex w-72 flex-col rounded-3xl bg-night-800/95 p-6"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-glow text-xl text-moon-500">{t('common.appName')}</span>
              <button
                onClick={onClose}
                aria-label={t('common.close')}
                className="rounded-full p-2 text-cream/70 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-2xl px-4 py-3 text-base font-semibold transition',
                        isActive ? 'bg-gold-500/15 text-gold-300' : 'text-cream/80 hover:bg-white/5',
                      )
                    }
                  >
                    {t(l.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <LanguageToggle />
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
