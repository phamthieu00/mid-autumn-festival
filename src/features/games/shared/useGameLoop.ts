import { useEffect, useRef } from 'react'

const MAX_DT = 0.05

/**
 * requestAnimationFrame loop delivering delta time in seconds (clamped).
 * Pauses automatically while the document is hidden.
 */
export function useGameLoop(callback: (dt: number) => void, running: boolean) {
  const cbRef = useRef(callback)
  useEffect(() => {
    cbRef.current = callback
  })

  useEffect(() => {
    if (!running) return
    let raf = 0
    let last: number | null = null

    const frame = (now: number) => {
      if (last != null) {
        const dt = Math.min((now - last) / 1000, MAX_DT)
        cbRef.current(dt)
      }
      last = now
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      last = null
      if (!document.hidden) raf = requestAnimationFrame(frame)
    }

    start()
    document.addEventListener('visibilitychange', start)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', start)
    }
  }, [running])
}
