import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { WishItem, WishListResponse } from '@maf/shared/api'
import type { LanternColor } from '@maf/shared/wishes'
import { api, API_BASE, ApiError } from '@/lib/api'
import { wishesStore } from './wishesStore'
import type { Wish } from './types'

export const WISHES_QUERY_KEY = ['wishes'] as const

export const toWish = (w: WishItem): Wish => ({
  id: w.id,
  name: w.displayName,
  text: w.text,
  color: w.color as LanternColor,
  createdAt: Date.parse(w.createdAt),
})

/**
 * Public wishes from the API with the local store as an offline fallback,
 * plus a live SSE stream that pushes other people's lanterns into the wall.
 */
export function useWishes() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: WISHES_QUERY_KEY,
    queryFn: () => api<WishListResponse>('/wishes?limit=30'),
    staleTime: 30_000,
  })
  const offline =
    q.isError && q.error instanceof ApiError && (q.error.isNetwork || q.error.status >= 500)
  // Live lanterns are keyed by the fetch they arrived after; a refetch naturally
  // supersedes them because the new list already contains those wishes.
  const [live, setLive] = useState<{ at: number; items: Wish[] }>({ at: 0, items: [] })
  const [lastLiveId, setLastLiveId] = useState<string | null>(null)
  const seen = useRef(new Set<string>())
  const fetchedAt = q.dataUpdatedAt

  const pushLive = useCallback(
    (item: WishItem) => {
      if (seen.current.has(item.id)) return
      seen.current.add(item.id)
      setLive((prev) => ({
        at: fetchedAt,
        items: [...(prev.at === fetchedAt ? prev.items : []).slice(-29), toWish(item)],
      }))
      setLastLiveId(item.id)
    },
    [fetchedAt],
  )

  useWishStream(pushLive, !offline && !q.isPending)

  const baseItems = q.data?.items ?? []
  const baseIds = new Set(baseItems.map((w) => w.id))
  const base: Wish[] = offline ? wishesStore.getAll() : baseItems.map(toWish).reverse()
  const liveItems = live.at === fetchedAt ? live.items.filter((w) => !baseIds.has(w.id)) : []
  const wishes = [...base, ...liveItems]
  const pending: Wish[] = (q.data?.pending ?? []).map(toWish)

  return {
    wishes,
    pending,
    total: wishes.length,
    offline,
    loading: q.isPending,
    lastLiveId,
    refresh: () => qc.invalidateQueries({ queryKey: WISHES_QUERY_KEY }),
  }
}

/** EventSource subscription with visibility pause; the browser handles reconnects (Last-Event-ID). */
export function useWishStream(onWish: (w: WishItem) => void, enabled = true) {
  const failures = useRef(0)
  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return
    let es: EventSource | null = null
    let stopped = false
    const open = () => {
      if (stopped || document.hidden) return
      es = new EventSource(`${API_BASE}/wishes/stream`)
      es.addEventListener('wish', (e) => {
        try {
          onWish(JSON.parse((e as MessageEvent).data) as WishItem)
        } catch {
          /* ignore */
        }
      })
      es.addEventListener('ready', () => (failures.current = 0))
      es.onerror = () => {
        failures.current++
        if (failures.current >= 5 && es) {
          es.close()
          es = null
        }
      }
    }
    const close = () => {
      es?.close()
      es = null
    }
    const onVis = () => (document.hidden ? close() : open())
    open()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVis)
      close()
    }
  }, [onWish, enabled])
}
