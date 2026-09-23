import { useSyncExternalStore } from 'react'
import { scoresStore } from './scoresStore'

export function useHighScores() {
  return useSyncExternalStore(scoresStore.subscribe, scoresStore.getAll, scoresStore.getAll)
}
