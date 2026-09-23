import { describe, expect, it } from 'vitest'
import { createDeck, initialMatchState, matchReducer } from './matchReducer'
import { seededRng } from '../../random'
import type { MatchState } from './types'

function start(): MatchState {
  return matchReducer(initialMatchState, { type: 'START', cards: createDeck(seededRng(42)) })
}

describe('matchReducer', () => {
  it('creates a 16-card deck with 8 pairs', () => {
    const deck = createDeck(seededRng(1))
    expect(deck).toHaveLength(16)
    const counts = new Map<string, number>()
    for (const c of deck) counts.set(c.flavorId, (counts.get(c.flavorId) ?? 0) + 1)
    expect([...counts.values()].every((n) => n === 2)).toBe(true)
  })

  it('flipping one card starts the timer and does not count a move', () => {
    const s1 = matchReducer(start(), { type: 'FLIP', id: 0, now: 1000 })
    expect(s1.startedAt).toBe(1000)
    expect(s1.moves).toBe(0)
    expect(s1.flipped).toEqual([0])
  })

  it('ignores flipping the same card twice and flips while checking', () => {
    let s = start()
    s = matchReducer(s, { type: 'FLIP', id: 0, now: 1 })
    const again = matchReducer(s, { type: 'FLIP', id: 0, now: 2 })
    expect(again).toBe(s)
    const other = s.cards.find((c) => c.id !== 0 && c.flavorId !== s.cards[0].flavorId)!
    s = matchReducer(s, { type: 'FLIP', id: other.id, now: 3 })
    expect(s.status).toBe('checking')
    expect(s.moves).toBe(1)
    const blocked = matchReducer(s, { type: 'FLIP', id: 5, now: 4 })
    expect(blocked).toBe(s)
    s = matchReducer(s, { type: 'RESOLVE' })
    expect(s.status).toBe('running')
    expect(s.cards.every((c) => !c.isFlipped)).toBe(true)
  })

  it('matches pairs and wins when all are matched', () => {
    let s = start()
    let now = 10
    const byFlavor = new Map<string, number[]>()
    for (const c of s.cards) byFlavor.set(c.flavorId, [...(byFlavor.get(c.flavorId) ?? []), c.id])
    for (const [a, b] of byFlavor.values()) {
      s = matchReducer(s, { type: 'FLIP', id: a, now: now++ })
      s = matchReducer(s, { type: 'FLIP', id: b, now: now++ })
    }
    expect(s.status).toBe('won')
    expect(s.matchedPairs).toBe(8)
    expect(s.moves).toBe(8)
    expect(s.finishedAt).toBe(now - 1)
  })
})
