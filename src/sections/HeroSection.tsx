import { motion } from 'motion/react'
import { ChevronDown, Gamepad2, Sparkles } from 'lucide-react'
import { useT } from '@/i18n'
import { LinkButton } from '@/components/ui/LinkButton'
import { Countdown } from '@/components/Countdown'
import { getNextMidAutumn } from '@/lib/midAutumnDates'

export function HeroSection() {
  const { t } = useT()
  const year = getNextMidAutumn()?.year ?? new Date().getFullYear()

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl flex-col items-center justify-center px-4 pt-16 pb-20 text-center sm:px-6">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-sm font-semibold tracking-[0.25em] text-lantern-400 uppercase"
      >
        {t('home.hero.eyebrow', { year })}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 16 }}
        className="font-display text-glow max-w-4xl text-5xl leading-[1.15] text-moon-500 sm:text-7xl lg:text-8xl"
      >
        {t('home.hero.title')}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 max-w-2xl text-base text-cream/75 sm:text-xl"
      >
        {t('home.hero.subtitle')}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <LinkButton to="/games" size="lg">
          <Gamepad2 className="size-5" />
          {t('home.hero.ctaGames')}
        </LinkButton>
        <LinkButton to="/wishes" size="lg" variant="secondary">
          <Sparkles className="size-5" />
          {t('home.hero.ctaWish')}
        </LinkButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-14 w-full max-w-2xl"
      >
        <Countdown />
      </motion.div>

      <a
        href="#story"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-cream/50 transition hover:text-cream"
      >
        {t('home.hero.scroll')}
        <ChevronDown className="animate-float size-5" />
      </a>
    </section>
  )
}
