import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { LANTERN_COLOR_IDS } from '@maf/shared/wishes'
import { NicknameSchema } from '@maf/shared/schemas'
import { requireUser, type SessionVars } from '../middleware/session'
import { ApiError } from '../middleware/error'
import { ensurePlayer, getPlayer, setColor, setNickname } from '../services/players'
import { invalidatePlayerCache } from '../services/playerCache'

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
      isAdmin: false,
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
