import { useCallback, useState } from 'react'
import { safeGet, safeSet } from '@/lib/storage'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => safeGet(key, initial))
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        safeSet(key, resolved)
        return resolved
      })
    },
    [key],
  )
  return [value, set] as const
}
