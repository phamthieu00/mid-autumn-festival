import { useEffect, useState } from 'react'

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isPast: boolean
}

export function splitDuration(ms: number): CountdownParts {
  const total = Math.max(0, ms)
  const s = Math.floor(total / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
    isPast: ms <= 0,
  }
}

export function useCountdown(target: Date | null): CountdownParts {
  const [now, setNow] = useState(() => Date.now())
  const active = target !== null

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])

  return splitDuration(target ? target.getTime() - now : 0)
}
