import { useSyncExternalStore } from 'react'
import { wishesStore } from './wishesStore'

export function useWishes() {
  return useSyncExternalStore(wishesStore.subscribe, wishesStore.getAll, wishesStore.getAll)
}
