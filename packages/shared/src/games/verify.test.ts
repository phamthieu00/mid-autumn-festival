import { describe, expect, it } from 'vitest'
import {
  gradeQuiz,
  verifyCatch,
  verifyMatch,
  verifyPuzzle,
  verifyRhythm,
  verifyRunner,
  verifyWord,
} from './verify'
import { generateChart } from './rhythm/chart'
import { shuffleSolvable, posForDir, slide, isSolved } from './puzzle/puzzleLogic'
import { pickEntries } from './word/wordReducer'
import { baseLetter } from './word/normalize'
import { seededRng } from '../random'
import { getBank } from '../quiz/bank/index'
import { pickQuizSet } from '../quiz/pickQuizSet'
import type { Dir } from './puzzle/types'

describe('verify: catch & runner bounds', () => {
  it('accepts a plausible catch and rejects impossible ones', () => {
    const ok = verifyCatch(
      { score: 40, counts: { lantern: 30, golden: 2, cloud: 3 }, maxCombo: 12 },
      60,
    )
    expect(ok.ok).toBe(true)
    expect(
      verifyCatch({ score: 40, counts: { lantern: 30, golden: 2, cloud: 3 }, maxCombo: 12 }, 20),
    ).toEqual({ ok: false, reason: 'TOO_FAST' })
    expect(
      verifyCatch({ score: 500, counts: { lantern: 30, golden: 2, cloud: 3 }, maxCombo: 12 }, 60)
        .ok,
    ).toBe(false)
    expect(
      verifyCatch({ score: 10, counts: { lantern: 5, golden: 0, cloud: 0 }, maxCombo: 9 }, 60).ok,
    ).toBe(false)
  })

  it('runner distance is bounded by speed × time', () => {
    expect(verifyRunner({ metres: 300, pickups: { mooncake: 5, star: 1 } }, 12).ok).toBe(true)
    const r = verifyRunner({ metres: 300, pickups: { mooncake: 5, star: 1 } }, 12)
    if (r.ok) expect(r.value).toBe(300 + 5 + 3)
    expect(verifyRunner({ metres: 5000, pickups: { mooncake: 0, star: 0 } }, 12).ok).toBe(false)
  })
})

describe('verify: replayed games', () => {
  it('rhythm replays judgements to an exact score', () => {
    const chart = generateChart(123)
    const all = chart.notes.map(() => 2 as const)
    const r = verifyRhythm({ judgements: all }, 123, 60)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value).toBeGreaterThan(chart.notes.length * 100)
      expect(r.meta.maxCombo).toBe(chart.notes.length)
    }
    expect(verifyRhythm({ judgements: all.slice(1) }, 123, 60)).toEqual({
      ok: false,
      reason: 'JUDGEMENT_COUNT',
    })
  })

  it('puzzle replays moves from the seeded shuffle', () => {
    const seed = 77
    let tiles = shuffleSolvable(3, seededRng(seed))
    // solve greedily with a tiny BFS on the 3x3 space
    const start = tiles.join(',')
    const prev = new Map<string, { from: string; dir: Dir } | null>([[start, null]])
    const queue = [tiles]
    let solvedKey: string | null = null
    while (queue.length) {
      const cur = queue.shift()!
      if (isSolved(cur)) {
        solvedKey = cur.join(',')
        break
      }
      for (const dir of ['up', 'down', 'left', 'right'] as Dir[]) {
        const pos = posForDir(cur, 3, dir)
        if (pos < 0) continue
        const next = slide(cur, 3, pos)
        const key = next.join(',')
        if (!prev.has(key)) {
          prev.set(key, { from: cur.join(','), dir })
          queue.push(next)
        }
      }
    }
    const moves: Dir[] = []
    for (let k = solvedKey!; prev.get(k); k = prev.get(k)!.from) moves.unshift(prev.get(k)!.dir)
    const r = verifyPuzzle({ size: 3, moves, seconds: moves.length }, seed, 30)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(moves.length)
    expect(verifyPuzzle({ size: 3, moves: moves.slice(0, -1), seconds: 10 }, seed, 30)).toEqual({
      ok: false,
      reason: 'NOT_SOLVED',
    })
    tiles = shuffleSolvable(3, seededRng(seed))
    void tiles
  })

  it('word replays guesses over the seeded entries', () => {
    const entries = pickEntries(seededRng(9))
    const rounds = entries.map((e) => ({
      guessed: [...new Set([...e.word].filter((c) => c !== ' ').map(baseLetter))],
    }))
    const r = verifyWord({ rounds }, 9, 30)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value).toBe(5 * 16)
      expect(r.meta.solved).toBe(5)
    }
    const wrong = verifyWord(
      { rounds: rounds.map(() => ({ guessed: ['Q', 'X', 'Y', 'V', 'P', 'B'] })) },
      9,
      30,
    )
    if (wrong.ok) expect(wrong.value).toBe(0)
  })

  it('match uses bounds only', () => {
    expect(verifyMatch({ moves: 12, seconds: 40 }, 45).ok).toBe(true)
    expect(verifyMatch({ moves: 7, seconds: 40 }, 45).ok).toBe(false)
    expect(verifyMatch({ moves: 20, seconds: 2 }, 45).ok).toBe(false)
  })

  it('grades a quiz from the server-side question set', () => {
    const qs = pickQuizSet(seededRng(5), getBank())
    const answers = qs.map((q, i) => (i % 2 === 0 ? q.correctIndex : (q.correctIndex + 1) % 4))
    const r = gradeQuiz(qs, answers, 40)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(5)
    expect(gradeQuiz(qs, answers.slice(1), 40).ok).toBe(false)
  })
})
