export interface MemoryCard {
  id: number
  flavorId: string
  isFlipped: boolean
  isMatched: boolean
}

export type MatchStatus = 'idle' | 'running' | 'checking' | 'won'

export interface MatchState {
  cards: MemoryCard[]
  flipped: number[]
  moves: number
  matchedPairs: number
  totalPairs: number
  status: MatchStatus
  startedAt: number | null
  finishedAt: number | null
}

export type MatchAction =
  | { type: 'START'; cards: MemoryCard[]; now?: number }
  | { type: 'FLIP'; id: number; now: number }
  | { type: 'RESOLVE' }
  | { type: 'RESET' }
