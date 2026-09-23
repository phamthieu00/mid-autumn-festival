import type { GameId } from '@maf/shared/games/ids'
export type { GameId }

export interface HighScore {
  gameId: GameId
  value: number
  secondary?: number
  achievedAt: number
}

export type HighScores = Partial<Record<GameId, HighScore>>

export interface ScoresStorage {
  version: 1
  scores: HighScores
}
