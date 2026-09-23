import { HIGHER_IS_BETTER, type GameId } from './ids'

export const RANK_CAP = 999_999
const clamp = (n: number) => Math.max(0, Math.min(RANK_CAP, Math.floor(n)))

/**
 * Single double that sorts DESC by game value, then by lower `secondary` (seconds).
 * Exact for all inputs because every intermediate is an integer below 2^53.
 */
export function encodeRankScore(gameId: GameId, value: number, secondary?: number | null): number {
  const v = clamp(value)
  const primary = HIGHER_IS_BETTER[gameId] ? v : RANK_CAP - v
  const tie = RANK_CAP - clamp(secondary ?? 0)
  return primary * 1_000_000 + tie
}

export function decodeRankScore(
  gameId: GameId,
  rank: number,
): { value: number; secondary: number } {
  const primary = Math.floor(rank / 1_000_000)
  const tie = rank - primary * 1_000_000
  const value = HIGHER_IS_BETTER[gameId] ? primary : RANK_CAP - primary
  return { value, secondary: RANK_CAP - tie }
}
