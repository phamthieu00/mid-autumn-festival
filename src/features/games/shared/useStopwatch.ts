import { useEffect, useState } from 'react'

/** Seconds elapsed since `startedAt` while `running`; frozen at `stoppedAt` when provided. */
export function useStopwatch(startedAt: number | null, stoppedAt: number | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (startedAt == null || stoppedAt != null) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [startedAt, stoppedAt])
  if (startedAt == null) return 0
  return Math.floor(((stoppedAt ?? now) - startedAt) / 1000)
}
