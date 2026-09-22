import { describe, expect, it } from 'vitest'
import { ALPHABET, baseLetter, toLetter } from './normalize'
import {
  applyGuess,
  initialWordState,
  MAX_WRONG,
  pickEntries,
  revealedMask,
  roundScore,
  wordReducer,
} from './wordReducer'
import { WORDS } from './words'
import { seededRng } from '@/lib/random'
import type { RoundState } from './types'

const round = (word: string): RoundState => ({
  entry: { id: 'x', word, category: 'food', hint: { vi: '', en: '' } },
  guessed: [],
  wrong: 0,
  status: 'playing',
})

describe('normalize', () => {
  it('strips diacritics but keeps Đ distinct', () => {
    expect(baseLetter('Ệ')).toBe('E')
    expect(baseLetter('ă')).toBe('A')
    expect(baseLetter('Ơ')).toBe('O')
    expect(baseLetter('ư')).toBe('U')
    expect(baseLetter('Đ')).toBe('Đ')
    expect(baseLetter('đ')).toBe('Đ')
    expect(baseLetter('D')).toBe('D')
    expect(toLetter('f')).toBeNull()
    expect(toLetter('W')).toBeNull()
    expect(toLetter('ệ')).toBe('E')
  })

  it('every word only uses alphabet letters or spaces', () => {
    const ids = new Set<string>()
    for (const e of WORDS) {
      expect(ids.has(e.id)).toBe(false)
      ids.add(e.id)
      expect(e.word.length).toBeLessThanOrEqual(14)
      for (const ch of e.word) {
        if (ch === ' ') continue
        expect((ALPHABET as readonly string[]).includes(baseLetter(ch))).toBe(true)
      }
    }
    expect(WORDS.length).toBeGreaterThanOrEqual(40)
  })
})

describe('wordReducer', () => {
  it('reveals accented variants with the base letter', () => {
    const mask = revealedMask('ĐÈN ÔNG SAO', ['O'])
    expect(mask).toEqual([false, false, false, true, true, false, false, true, false, false, true])
  })

  it('applies guesses, counts wrong ones, wins and loses', () => {
    let r = round('ĐÈN')
    r = applyGuess(r, 'X')
    expect(r.wrong).toBe(1)
    expect(applyGuess(r, 'X')).toBe(r)
    r = applyGuess(r, 'Đ')
    r = applyGuess(r, 'E')
    r = applyGuess(r, 'N')
    expect(r.status).toBe('won')
    expect(roundScore(r)).toBe(10 + MAX_WRONG - 1)

    let l = round('ĐÈN')
    for (const ch of ['A', 'B', 'C', 'G', 'H', 'I'] as const) l = applyGuess(l, ch)
    expect(l.status).toBe('lost')
    expect(roundScore(l)).toBe(0)
  })

  it('picks distinct entries deterministically with varied categories', () => {
    const a = pickEntries(seededRng(1))
    const b = pickEntries(seededRng(1))
    expect(a.map((e) => e.id)).toEqual(b.map((e) => e.id))
    expect(new Set(a.map((e) => e.id)).size).toBe(5)
    expect(new Set(a.map((e) => e.category)).size).toBeGreaterThanOrEqual(4)
  })

  it('runs a full game to finished with the summed score', () => {
    const entries = pickEntries(seededRng(3))
    let s = wordReducer(initialWordState, { type: 'START', entries, now: 1 })
    let expected = 0
    for (let i = 0; i < entries.length; i++) {
      for (const ch of new Set([...entries[i].word].filter((c) => c !== ' ').map(baseLetter))) {
        s = wordReducer(s, { type: 'GUESS', letter: ch as never })
      }
      expect(s.status).toBe('roundEnd')
      expected += 10 + MAX_WRONG
      s = wordReducer(s, { type: 'NEXT', now: 10 + i })
    }
    expect(s.status).toBe('finished')
    expect(s.score).toBe(expected)
    expect(s.solved).toBe(5)
  })
})
