import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { GameIdSchema } from '@maf/shared/games/rules'
import type { SessionVars } from '../middleware/session'
import { getLeaderboard, leaderboardSummary } from '../services/leaderboards'

const Query = z.object({
  period: z.enum(['daily', 'weekly', 'alltime']).default('alltime'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const leaderboardRoutes = new Hono<SessionVars>()
  .get('/leaderboards/summary', async (c) => {
    c.header('Cache-Control', 'public, max-age=30')
    return c.json({ period: 'alltime', leaders: await leaderboardSummary('alltime') })
  })
  .get(
    '/leaderboards/:gameId',
    zValidator('param', z.object({ gameId: GameIdSchema })),
    zValidator('query', Query),
    async (c) => {
      const { gameId } = c.req.valid('param')
      const { period, limit } = c.req.valid('query')
      const board = await getLeaderboard(gameId, period, limit, c.get('user')?.id ?? null)
      return c.json(board)
    },
  )
