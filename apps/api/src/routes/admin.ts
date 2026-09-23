import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAdmin, type SessionVars } from '../middleware/session'
import { adminListWishes, adminSetStatus, publicWish } from '../services/wishes'

const Status = z.enum(['visible', 'pending', 'hidden'])

export const adminRoutes = new Hono<SessionVars>()
  .use('/admin/*', requireAdmin)
  .get(
    '/admin/wishes',
    zValidator('query', z.object({ status: Status.default('pending') })),
    async (c) => {
      const rows = await adminListWishes(c.req.valid('query').status)
      return c.json({
        items: rows.map((w) => ({
          ...publicWish(w),
          reportCount: w.reportCount,
          userId: w.userId,
        })),
      })
    },
  )
  .patch('/admin/wishes/:id', zValidator('json', z.object({ status: Status })), async (c) => {
    return c.json({ wish: await adminSetStatus(c.req.param('id'), c.req.valid('json').status) })
  })
