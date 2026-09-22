export type GameId = 'catch' | 'match' | 'quiz' | 'runner' | 'rhythm' | 'puzzle' | 'word'

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
