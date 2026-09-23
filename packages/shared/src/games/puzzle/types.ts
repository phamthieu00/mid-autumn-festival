export type PuzzleSize = 3 | 4
export type Dir = 'up' | 'down' | 'left' | 'right'

export interface PuzzleState {
  size: PuzzleSize
  /** tiles[pos] = id of the tile at that position; id === solved position. blank = size*size - 1 */
  tiles: number[]
  moves: number
  status: 'idle' | 'running' | 'won'
  startedAt: number | null
  finishedAt: number | null
}

export type PuzzleAction =
  | { type: 'START'; size: PuzzleSize; tiles: number[]; now: number }
  | { type: 'SLIDE'; pos: number; now: number }
  | { type: 'KEY'; dir: Dir; now: number }
  | { type: 'RESET' }
