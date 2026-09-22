import { motion, useScroll, useTransform } from 'motion/react'
import { Stars } from './Stars'
import { Moon } from './Moon'
import { FloatingLanterns } from './FloatingLanterns'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function NightSky() {
  const { scrollY } = useScroll()
  const reduced = usePrefersReducedMotion()
  const moonY = useTransform(scrollY, [0, 1200], [0, reduced ? 0 : 260])
  const moonOpacity = useTransform(scrollY, [0, 900], [1, 0.45])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <Stars />
      <motion.div
        style={{ y: moonY, opacity: moonOpacity }}
        className="absolute top-20 right-[6%] sm:top-24 sm:right-[10%]"
      >
        <Moon />
      </motion.div>
      <FloatingLanterns />
      {/* hills silhouette */}
      <svg
        className="absolute inset-x-0 bottom-0 h-40 w-full text-night-950 sm:h-56"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          fillOpacity="0.85"
          d="M0 160 C 120 120, 220 200, 360 150 S 600 90, 760 140 S 1000 210, 1160 150 S 1360 100, 1440 130 L1440 240 L0 240 Z"
        />
        <path
          fill="currentColor"
          d="M0 200 C 180 170, 300 230, 480 200 S 780 160, 960 200 S 1260 240, 1440 190 L1440 240 L0 240 Z"
        />
      </svg>
    </div>
  )
}
