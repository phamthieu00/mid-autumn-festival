import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useT } from '@/i18n'
import { useCountdown } from '@/hooks/useCountdown'
import { getNextMidAutumn } from '@/lib/midAutumnDates'
import { pad2 } from '@/lib/format'

export function Countdown({ now }: { now?: Date }) {
  const { t, lang } = useT()
  const info = useMemo(() => getNextMidAutumn(now ?? new Date()), [now])
  const parts = useCountdown(info && !info.isTonight ? info.start : null)

  if (!info) {
    return <p className="text-center text-cream/70">{t('home.countdown.unknown')}</p>
  }

  if (info.isTonight) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-3xl px-6 py-5 text-center text-lg font-semibold text-moon-300"
      >
        {t('home.countdown.tonight')}
      </motion.div>
    )
  }

  const dateLabel = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(info.start)

  const tiles = [
    { label: t('home.countdown.days'), value: parts.days },
    { label: t('home.countdown.hours'), value: parts.hours },
    { label: t('home.countdown.minutes'), value: parts.minutes },
    { label: t('home.countdown.seconds'), value: parts.seconds },
  ]

  return (
    <div className="space-y-4" aria-live="polite">
      <p className="text-center text-sm font-semibold tracking-[0.2em] text-lantern-400 uppercase">
        {t('home.countdown.title')}
      </p>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * i }}
            className="glass flex flex-col items-center rounded-2xl px-2 py-3 sm:py-5"
          >
            <span className="font-display text-glow text-3xl leading-none text-moon-500 tabular-nums sm:text-5xl">
              {pad2(tile.value)}
            </span>
            <span className="mt-2 text-[11px] font-semibold tracking-wider text-cream/60 uppercase sm:text-xs">
              {tile.label}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-sm text-cream/60">{t('home.countdown.until', { date: dateLabel })}</p>
    </div>
  )
}
