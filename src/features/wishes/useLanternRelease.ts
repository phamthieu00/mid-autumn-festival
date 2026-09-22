import { useCallback, useEffect, useRef, useState } from 'react'
import type { Wish } from './types'

export interface ReleaseState {
  wish: Wish
  origin: { x: number; y: number }
}

export function useLanternRelease() {
  const [releasing, setReleasing] = useState<ReleaseState | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const release = useCallback((wish: Wish, origin: { x: number; y: number }) => {
    setReleasing({ wish, origin })
  }, [])

  const finish = useCallback(() => {
    setReleasing((cur) => {
      if (cur) {
        setHighlightId(cur.wish.id)
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setHighlightId(null), 3500)
      }
      return null
    })
  }, [])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  return { releasing, highlightId, release, finish }
}
