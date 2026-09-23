import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { GameIdSchema, SessionModeSchema } from '@maf/shared/games/rules'
import type { SessionVars } from '../middleware/session'
import { rateLimit } from '../middleware/rateLimit'
import { clientIpHash } from '../middleware/ip'
import { startSession } from '../services/sessions/start'
import { answerQuestion, finishSession } from '../services/sessions/finish'
import { metrics } from '../metrics'

const StartBody = z.object({ mode: SessionModeSchema.default('free') })
const AnswerBody = z.object({
  index: z.number().int().min(0).max(50),
  option: z.number().int().min(0).max(10),
})

export const gameRoutes = new Hono<SessionVars>()
  .post(
    '/games/:gameId/sessions',
    rateLimit({ scope: 'session_start', limit: 20, windowMs: 60_000, perIpLimit: 60 }),
    zValidator('param', z.object({ gameId: GameIdSchema })),
    zValidator('json', StartBody),
    async (c) => {
      const { gameId } = c.req.valid('param')
      const { mode } = c.req.valid('json')
      const user = c.get('user')
      const result = await startSession({
        userId: user?.id ?? null,
        gameId,
        mode,
        ipHash: clientIpHash(c),
      })
      metrics.sessionsStarted.inc({ game: gameId, mode })
      return c.json(result, 201)
    },
  )
  .post('/sessions/:id/answer', zValidator('json', AnswerBody), async (c) => {
    const { index, option } = c.req.valid('json')
    const res = await answerQuestion(c.req.param('id'), c.get('user')?.id ?? null, index, option)
    return c.json(res)
  })
  .post('/sessions/:id/finish', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const res = await finishSession(c.req.param('id'), c.get('user')?.id ?? null, body)
    return c.json(res)
  })
