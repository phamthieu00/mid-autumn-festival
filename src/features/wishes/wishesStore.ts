import { safeGet, safeSet } from '@/lib/storage'
import { WISH_NAME_MAX, WISH_TEXT_MAX, WISHES_CAP, type Wish, type WishesStorage } from './types'
import type { LanternColor } from '@/components/ui/lanternColors'

const KEY = 'wishes'
const listeners = new Set<() => void>()
let cache: Wish[] | null = null

function load(): Wish[] {
  if (cache) return cache
  const raw = safeGet<WishesStorage | null>(KEY, null)
  cache = raw?.version === 1 && Array.isArray(raw.items) ? raw.items : []
  return cache
}

function persist(items: Wish[]): boolean {
  cache = items
  const ok = safeSet<WishesStorage>(KEY, { version: 1, items })
  listeners.forEach((l) => l())
  return ok
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export type AddWishResult = { ok: true; wish: Wish; persisted: boolean } | { ok: false; reason: 'empty' | 'tooLong' }

export const wishesStore = {
  getAll: (): Wish[] => load(),
  add(input: { text: string; name?: string; color: LanternColor }): AddWishResult {
    const text = input.text.trim().replace(/\s+/g, ' ')
    const name = input.name?.trim().slice(0, WISH_NAME_MAX) || undefined
    if (!text) return { ok: false, reason: 'empty' }
    if (text.length > WISH_TEXT_MAX) return { ok: false, reason: 'tooLong' }
    const wish: Wish = { id: makeId(), text, name, color: input.color, createdAt: Date.now() }
    const next = [...load(), wish].slice(-WISHES_CAP)
    const persisted = persist(next)
    return { ok: true, wish, persisted }
  },
  remove(id: string) {
    persist(load().filter((w) => w.id !== id))
  },
  clear() {
    persist([])
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  __clearCache() {
    cache = null
  },
}
