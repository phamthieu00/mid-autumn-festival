import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { SessionVars } from '../middleware/session'
import { rateLimit } from '../middleware/rateLimit'
import { loadResult } from '../services/results'
import { renderResultPng } from '../services/og'

const LangQuery = z.object({ lang: z.enum(['vi', 'en']).default('vi') })

export const resultRoutes = new Hono<SessionVars>()
  .get('/results/:publicId', async (c) => {
    c.header('Cache-Control', 'public, max-age=60')
    return c.json(await loadResult(c.req.param('publicId')))
  })
  .get(
    '/og/results/:publicId',
    rateLimit({ scope: 'og_render', limit: 30, windowMs: 60_000 }),
    zValidator('query', LangQuery),
    async (c) => {
      const publicId = c.req.param('publicId').replace(/\.png$/, '')
      const r = await loadResult(publicId)
      const png = await renderResultPng({
        publicId,
        gameId: r.gameId,
        value: r.value,
        secondary: r.secondary,
        nickname: r.player?.nickname ?? null,
        color: r.player?.color ?? 'red',
        rank: r.rank,
        dailyKey: r.dailyKey,
        lang: c.req.valid('query').lang,
      })
      c.header('Content-Type', 'image/png')
      c.header('Cache-Control', 'public, max-age=86400, s-maxage=86400')
      c.header('Cross-Origin-Resource-Policy', 'cross-origin')
      return c.body(new Uint8Array(png))
    },
  )
