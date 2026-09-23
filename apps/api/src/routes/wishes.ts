import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { WishInputSchema } from '@maf/shared/schemas'
import type { SessionVars } from '../middleware/session'
import { rateLimit } from '../middleware/rateLimit'
import { clientIp, clientIpHash } from '../middleware/ip'
import { ApiError } from '../middleware/error'
import { createWish, listWishes, myPendingWishes, reportWish } from '../services/wishes'
import { replaySince, subscribeWishes } from '../services/wishStream'
import { getPlayer } from '../services/players'
import { awardBadges } from '../services/badges'
import { metrics } from '../metrics'

const ListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
})
const ReportBody = z.object({ reason: z.string().max(200).optional() })

const SSE_MAX_PER_IP = 5
const sseByIp = new Map<string, number>()

export const wishRoutes = new Hono<SessionVars>()
  .get('/wishes', zValidator('query', ListQuery), async (c) => {
    const { cursor, limit } = c.req.valid('query')
    const user = c.get('user')
    const page = await listWishes({ cursor, limit, viewerId: user?.id ?? null })
    const pending = user && !cursor ? await myPendingWishes(user.id) : []
    return c.json({ ...page, pending })
  })
  .post(
    '/wishes',
    rateLimit({ scope: 'wish', limit: 5, windowMs: 3_600_000, perIpLimit: 20 }),
    zValidator('json', WishInputSchema),
    async (c) => {
      const user = c.get('user')
      const input = c.req.valid('json')
      const player = user ? await getPlayer(user.id) : null
      const fallbackName = player?.nickname ?? (input.lang === 'en' ? 'Someone' : 'Ai đó')
      const wish = await createWish(input, {
        userId: user?.id ?? null,
        ipHash: clientIpHash(c),
        fallbackName,
      })
      const newBadges = user ? await awardBadges(user.id, { stats: { wishes: 1 } }) : []
      return c.json({ wish, newBadges }, 201)
    },
  )
  .post(
    '/wishes/:id/report',
    rateLimit({ scope: 'report', limit: 10, windowMs: 3_600_000 }),
    zValidator('json', ReportBody),
    async (c) => {
      const id = c.req.param('id')
      if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, 'BAD_ID')
      const user = c.get('user')
      const reporterKey = user ? `u:${user.id}` : `ip:${clientIpHash(c)}`
      return c.json(await reportWish(id, reporterKey, c.req.valid('json').reason))
    },
  )
  .get('/wishes/stream', async (c) => {
    const ip = clientIp(c)
    const current = sseByIp.get(ip) ?? 0
    if (current >= SSE_MAX_PER_IP) throw new ApiError(429, 'TOO_MANY_STREAMS')
    sseByIp.set(ip, current + 1)
    metrics.sseClients.inc({}, 1)
    c.header('Cache-Control', 'no-cache, no-transform')
    c.header('X-Accel-Buffering', 'no')
    const lastEventId = c.req.header('last-event-id')
    return streamSSE(
      c,
      async (stream) => {
        let closed = false
        const release = () => {
          if (closed) return
          closed = true
          unsubscribe()
          clearInterval(heartbeat)
          sseByIp.set(ip, Math.max(0, (sseByIp.get(ip) ?? 1) - 1))
          metrics.sseClients.inc({}, -1)
        }
        const unsubscribe = subscribeWishes((ev) => {
          void stream
            .writeSSE({ event: 'wish', id: ev.id, data: JSON.stringify(ev) })
            .catch(release)
        })
        const heartbeat = setInterval(() => {
          void stream.writeSSE({ event: 'ping', data: String(Date.now()) }).catch(release)
        }, 25_000)
        stream.onAbort(release)
        for (const ev of await replaySince(lastEventId)) {
          await stream.writeSSE({ event: 'wish', id: ev.id, data: JSON.stringify(ev) })
        }
        await stream.writeSSE({ event: 'ready', data: '1' })
        while (!closed) await stream.sleep(1000)
      },
      async (err, stream) => {
        await stream.writeSSE({ event: 'error', data: err.message })
      },
    )
  })
