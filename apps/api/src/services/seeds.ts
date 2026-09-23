import { createHmac, randomInt } from 'node:crypto'
import { env } from '../env'
import type { GameId } from '@maf/shared/games/ids'

/** 31-bit seed derived from the daily key so the server can regenerate content but players can't predict tomorrow. */
export function dailySeed(dailyKey: string, gameId: GameId): number {
  const digest = createHmac('sha256', env.DAILY_SEED_SECRET)
    .update(`${dailyKey}:${gameId}`)
    .digest()
  return digest.readUInt32BE(0) & 0x7fffffff
}

export const randomSeed = () => randomInt(1, 0x7fffffff)
