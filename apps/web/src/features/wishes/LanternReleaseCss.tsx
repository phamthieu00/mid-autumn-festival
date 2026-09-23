import { motion } from 'motion/react'
import { LanternIcon } from '@/components/ui/LanternIcon'
import type { Wish } from './types'

export function LanternReleaseCss({
  wish,
  origin,
  reduced,
  onDone,
}: {
  wish: Wish
  origin: { x: number; y: number }
  reduced: boolean
  onDone: () => void
}) {
  const size = 72
  const style = {
    left: origin.x - size / 2,
    top: origin.y - size * 0.78,
    width: size,
    height: size * 1.56,
  }
  if (reduced) {
    return (
      <motion.div
        className="absolute"
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.2, times: [0, 0.25, 0.75, 1] }}
        onAnimationComplete={onDone}
      >
        <LanternIcon color={wish.color} className="size-full" />
      </motion.div>
    )
  }
  return (
    <motion.div
      className="absolute"
      style={style}
      initial={{ opacity: 0, scale: 0.4, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.4, 1, 0.4, 0.3],
        y: [0, -20, -window.innerHeight * 0.9, -window.innerHeight * 1.1],
      }}
      transition={{ duration: 3.2, times: [0, 0.15, 0.85, 1], ease: 'easeInOut' }}
      onAnimationComplete={onDone}
    >
      <LanternIcon color={wish.color} className="animate-sway size-full" />
    </motion.div>
  )
}
