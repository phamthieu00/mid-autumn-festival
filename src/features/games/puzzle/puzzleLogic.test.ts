import { describe, expect, it } from 'vitest'
import {
  initialPuzzleState,
  isSolvable,
  isSolved,
  posForDir,
  puzzleReducer,
  shuffleSolvable,
  slide,
  solvedTiles,
} from './puzzleLogic'
import { seededRng } from '@/lib/random'

describe('puzzleLogic', () => {
  it('knows solvable and unsolvable boards', () => {
    expect(isSolvable(solvedTiles(3), 3)).toBe(true)
    expect(isSolvable(solvedTiles(4), 4)).toBe(true)
    expect(isSolvable([1, 0, 2, 3, 4, 5, 6, 7, 8], 3)).toBe(false)
    // classic 4x4: blank in row 3 from bottom (row index 1), swap two tiles -> odd inversions
    expect(isSolvable([0, 1, 2, 3, 4, 15, 6, 7, 8, 9, 10, 11, 12, 13, 14, 5], 4)).toBe(false)
  })

  it('shuffleSolvable is always solvable, unsolved and deterministic', () => {
    for (let k = 1; k <= 50; k++) {
      for (const n of [3, 4] as const) {
        const tiles = shuffleSolvable(n, seededRng(k))
        expect(isSolvable(tiles, n)).toBe(true)
        expect(isSolved(tiles)).toBe(false)
        expect([...tiles].sort((a, b) => a - b)).toEqual(solvedTiles(n))
      }
    }
    expect(shuffleSolvable(3, seededRng(9))).toEqual(shuffleSolvable(3, seededRng(9)))
  })

  it('slides only tiles adjacent to the blank', () => {
    const t = solvedTiles(3) // blank at 8
    expect(slide(t, 3, 0)).toBe(t)
    const moved = slide(t, 3, 7)
    expect(moved[8]).toBe(7)
    expect(moved[7]).toBe(8)
  })

  it('maps arrow keys to the right tile, or -1 at the edge', () => {
    const t = solvedTiles(3) // blank bottom-right
    expect(posForDir(t, 3, 'down')).toBe(5) // tile above blank slides down
    expect(posForDir(t, 3, 'right')).toBe(7) // tile left of blank slides right
    expect(posForDir(t, 3, 'up')).toBe(-1)
    expect(posForDir(t, 3, 'left')).toBe(-1)
  })

  it('reducer counts moves and detects the win', () => {
    const oneAway = slide(solvedTiles(3), 3, 7)
    let s = puzzleReducer(initialPuzzleState, { type: 'START', size: 3, tiles: oneAway, now: 1 })
    expect(puzzleReducer(s, { type: 'SLIDE', pos: 0, now: 2 })).toBe(s)
    s = puzzleReducer(s, { type: 'KEY', dir: 'left', now: 3 })
    expect(s.moves).toBe(1)
    expect(s.status).toBe('won')
    expect(s.finishedAt).toBe(3)
  })
})
