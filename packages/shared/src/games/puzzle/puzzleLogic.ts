import { shuffle } from '../../random'
import type { Dir, PuzzleAction, PuzzleState } from './types'

export const solvedTiles = (n: number) => Array.from({ length: n * n }, (_, i) => i)
export const blankId = (n: number) => n * n - 1

export function inversions(tiles: readonly number[], n: number): number {
  const blank = blankId(n)
  const arr = tiles.filter((t) => t !== blank)
  let inv = 0
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++
  return inv
}

export function isSolvable(tiles: readonly number[], n: number): boolean {
  const inv = inversions(tiles, n)
  if (n % 2 === 1) return inv % 2 === 0
  const blankPos = tiles.indexOf(blankId(n))
  const rowFromBottom = n - Math.floor(blankPos / n) // 1-based
  return (inv + rowFromBottom) % 2 === 1
}

export const isSolved = (tiles: readonly number[]) => tiles.every((v, i) => v === i)

export function neighbors(pos: number, n: number): number[] {
  const r = Math.floor(pos / n)
  const c = pos % n
  const out: number[] = []
  if (r > 0) out.push(pos - n)
  if (r < n - 1) out.push(pos + n)
  if (c > 0) out.push(pos - 1)
  if (c < n - 1) out.push(pos + 1)
  return out
}

export function canSlide(tiles: readonly number[], n: number, pos: number): boolean {
  const blankPos = tiles.indexOf(blankId(n))
  return neighbors(blankPos, n).includes(pos)
}

/** Slide the tile at `pos` into the blank. Returns the same array when the move is illegal. */
export function slide(tiles: number[], n: number, pos: number): number[] {
  if (!canSlide(tiles, n, pos)) return tiles
  const blankPos = tiles.indexOf(blankId(n))
  const next = tiles.slice()
  next[blankPos] = tiles[pos]
  next[pos] = tiles[blankPos]
  return next
}

/** Position of the tile that would move in direction `dir` (i.e. the tile on the opposite side of the blank). */
export function posForDir(tiles: readonly number[], n: number, dir: Dir): number {
  const blankPos = tiles.indexOf(blankId(n))
  const r = Math.floor(blankPos / n)
  const c = blankPos % n
  switch (dir) {
    case 'up':
      return r < n - 1 ? blankPos + n : -1
    case 'down':
      return r > 0 ? blankPos - n : -1
    case 'left':
      return c < n - 1 ? blankPos + 1 : -1
    case 'right':
      return c > 0 ? blankPos - 1 : -1
  }
}

export function shuffleSolvable(n: number, rng: () => number = Math.random): number[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const tiles = shuffle(solvedTiles(n), rng)
    if (!isSolvable(tiles, n)) {
      // swapping two non-blank tiles flips the parity
      const blank = blankId(n)
      const [a, b] = tiles.map((t, i) => (t === blank ? -1 : i)).filter((i) => i >= 0)
      ;[tiles[a], tiles[b]] = [tiles[b], tiles[a]]
    }
    if (!isSolved(tiles)) return tiles
  }
  // extremely unlikely fallback: one legal move away from solved
  const tiles = solvedTiles(n)
  return slide(tiles, n, n * n - 2)
}

export const initialPuzzleState: PuzzleState = {
  size: 3,
  tiles: [],
  moves: 0,
  status: 'idle',
  startedAt: null,
  finishedAt: null,
}

export function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case 'START':
      return {
        size: action.size,
        tiles: action.tiles,
        moves: 0,
        status: 'running',
        startedAt: action.now,
        finishedAt: null,
      }
    case 'RESET':
      return initialPuzzleState
    case 'SLIDE':
    case 'KEY': {
      if (state.status !== 'running') return state
      const pos =
        action.type === 'SLIDE' ? action.pos : posForDir(state.tiles, state.size, action.dir)
      if (pos < 0) return state
      const tiles = slide(state.tiles, state.size, pos)
      if (tiles === state.tiles) return state
      const won = isSolved(tiles)
      return {
        ...state,
        tiles,
        moves: state.moves + 1,
        status: won ? 'won' : 'running',
        finishedAt: won ? action.now : null,
      }
    }
    default:
      return state
  }
}
