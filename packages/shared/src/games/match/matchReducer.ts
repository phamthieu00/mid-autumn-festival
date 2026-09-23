import { shuffle } from '../../random'
import { FLAVOR_IDS } from './flavorIds'
import type { MatchAction, MatchState, MemoryCard } from './types'

export function createDeck(rng: () => number = Math.random): MemoryCard[] {
  const ids = FLAVOR_IDS.flatMap((id) => [id, id])
  return shuffle(ids, rng).map((flavorId, i) => ({
    id: i,
    flavorId,
    isFlipped: false,
    isMatched: false,
  }))
}

export const initialMatchState: MatchState = {
  cards: [],
  flipped: [],
  moves: 0,
  matchedPairs: 0,
  totalPairs: FLAVOR_IDS.length,
  status: 'idle',
  startedAt: null,
  finishedAt: null,
}

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'START':
      return {
        ...initialMatchState,
        cards: action.cards,
        totalPairs: action.cards.length / 2,
        status: 'running',
      }
    case 'RESET':
      return initialMatchState
    case 'FLIP': {
      if (state.status !== 'running') return state
      const card = state.cards.find((c) => c.id === action.id)
      if (!card || card.isFlipped || card.isMatched || state.flipped.length >= 2) return state

      const startedAt = state.startedAt ?? action.now
      const cards = state.cards.map((c) => (c.id === action.id ? { ...c, isFlipped: true } : c))
      const flipped = [...state.flipped, action.id]
      if (flipped.length < 2) return { ...state, cards, flipped, startedAt }

      const [a, b] = flipped.map((id) => cards.find((c) => c.id === id)!)
      const moves = state.moves + 1
      if (a.flavorId === b.flavorId) {
        const matchedCards = cards.map((c) =>
          c.id === a.id || c.id === b.id ? { ...c, isMatched: true } : c,
        )
        const matchedPairs = state.matchedPairs + 1
        const won = matchedPairs === state.totalPairs
        return {
          ...state,
          cards: matchedCards,
          flipped: [],
          moves,
          matchedPairs,
          startedAt,
          status: won ? 'won' : 'running',
          finishedAt: won ? action.now : null,
        }
      }
      return { ...state, cards, flipped, moves, startedAt, status: 'checking' }
    }
    case 'RESOLVE': {
      if (state.status !== 'checking') return state
      const cards = state.cards.map((c) =>
        state.flipped.includes(c.id) ? { ...c, isFlipped: false } : c,
      )
      return { ...state, cards, flipped: [], status: 'running' }
    }
    default:
      return state
  }
}
