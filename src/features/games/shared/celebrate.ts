import confetti from 'canvas-confetti'

const COLORS = ['#FFD166', '#FF6B35', '#E63946', '#fff8dc', '#ff8fb1']

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function celebrate(big = false) {
  if (reducedMotion()) return
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 70 }
  confetti({ ...base, particleCount: big ? 120 : 70, spread: 70, origin: { x: 0.2, y: 0.8 }, angle: 60 })
  confetti({ ...base, particleCount: big ? 120 : 70, spread: 70, origin: { x: 0.8, y: 0.8 }, angle: 120 })
  if (big) {
    window.setTimeout(() => {
      confetti({ ...base, particleCount: 160, spread: 120, startVelocity: 40, origin: { x: 0.5, y: 0.6 } })
    }, 350)
  }
}

export function sparkleAt(x: number, y: number) {
  if (reducedMotion()) return
  confetti({
    particleCount: 14,
    spread: 50,
    startVelocity: 18,
    gravity: 0.8,
    ticks: 60,
    scalar: 0.7,
    colors: COLORS,
    origin: { x, y },
    disableForReducedMotion: true,
    zIndex: 70,
  })
}
