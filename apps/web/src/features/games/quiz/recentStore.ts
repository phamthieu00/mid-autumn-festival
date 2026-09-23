import { safeGet, safeSet } from '@/lib/storage'

const KEY = 'quiz-recent'
export const RECENT_CAP = 60

interface RecentStorage {
  version: 1
  ids: string[]
}

let cache: string[] | null = null

function load(): string[] {
  if (cache) return cache
  const raw = safeGet<RecentStorage | null>(KEY, null)
  cache = raw?.version === 1 && Array.isArray(raw.ids) ? raw.ids : []
  return cache
}

export const recentStore = {
  get: (): string[] => load(),
  push(ids: readonly string[]) {
    const next = [...load().filter((id) => !ids.includes(id)), ...ids].slice(-RECENT_CAP)
    cache = next
    safeSet<RecentStorage>(KEY, { version: 1, ids: next })
  },
  clear() {
    cache = []
    safeSet<RecentStorage>(KEY, { version: 1, ids: [] })
  },
  __clearCache() {
    cache = null
  },
}
