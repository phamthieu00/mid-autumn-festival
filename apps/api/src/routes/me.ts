import { Hono } from 'hono'
import { deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { LANTERN_COLOR_IDS } from '@maf/shared/wishes'
import { NicknameSchema } from '@maf/shared/schemas'
import { requireUser, type SessionVars } from '../middleware/session'
import { ApiError } from '../middleware/error'
import { ensurePlayer, getPlayer, setColor, setNickname } from '../services/players'
import { invalidatePlayerCache } from '../services/playerCache'
import { listBadges } from '../services/badges'
import { deleteAccount, exportAccount } from '../services/account'
import { rateLimit } from '../middleware/rateLimit'
import { env, isProd } from '../env'

const PatchMe = z.object({
  nickname: NicknameSchema.optional(),
  color: z.enum(LANTERN_COLOR_IDS).optional(),
})

export const meRoutes = new Hono<SessionVars>()
  .get('/me', async (c) => {
    const user = c.get('user')
    if (!user) return c.json({ user: null, player: null })
    let player = await getPlayer(user.id)
    if (!player) {
      await ensurePlayer(user.id, user.image ?? null)
      player = await getPlayer(user.id)
    }
    return c.json({
      user: { id: user.id, name: user.name, email: user.email, image: user.image ?? null },
      player: player && {
        nickname: player.nickname,
        color: player.color,
        locale: player.locale,
        legacyBests: player.legacyBests ?? null,
        createdAt: player.createdAt,
      },
      badges: await listBadges(user.id),
      isAdmin: user.emailVerified && env.ADMIN_EMAILS.includes(user.email.toLowerCase()),
    })
  })
  .patch('/me', requireUser, zValidator('json', PatchMe), async (c) => {
    const user = c.get('user')!
    const body = c.req.valid('json')
    if (body.nickname !== undefined) {
      const res = await setNickname(user.id, body.nickname)
      if (!res.ok) {
        throw new ApiError(409, res.reason === 'taken' ? 'NICKNAME_TAKEN' : 'NICKNAME_RESERVED')
      }
    }
    if (body.color) await setColor(user.id, body.color)
    await invalidatePlayerCache(user.id)
    const player = await getPlayer(user.id)
    return c.json({ player: player && { nickname: player.nickname, color: player.color } })
  })
  .get(
    '/me/export',
    requireUser,
    rateLimit({ scope: 'export', limit: 5, windowMs: 3_600_000 }),
    async (c) => {
      const user = c.get('user')!
      const data = await exportAccount(user.id)
      c.header('Cache-Control', 'no-store')
      c.header(
        'Content-Disposition',
        `attachment; filename="dem-trang-ram-export-${data.exportedAt.slice(0, 10)}.json"`,
      )
      return c.json(data)
    },
  )
  .delete('/me', requireUser, async (c) => {
    const user = c.get('user')!
    const lang = c.req.query('lang') === 'en' ? 'en' : 'vi'
    await deleteAccount(user.id, lang)
    for (const name of ['maf.session_token', 'maf.session_data']) {
      deleteCookie(c, name, { path: '/' })
      if (isProd) deleteCookie(c, `__Secure-${name}`, { path: '/', secure: true })
    }
    return c.json({ ok: true })
  })
