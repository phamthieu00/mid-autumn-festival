import { createMiddleware } from 'hono/factory'
import { auth, type AuthSession } from '../auth'
import { env } from '../env'
import { logger } from '../logger'
import { ApiError } from './error'

export type SessionVars = {
  Variables: {
    requestId: string
    user: AuthSession['user'] | null
    session: AuthSession['session'] | null
  }
}

export const sessionMiddleware = createMiddleware<SessionVars>(async (c, next) => {
  let s: AuthSession | null = null
  try {
    s = await auth.api.getSession({ headers: c.req.raw.headers })
  } catch (err) {
    // DB hiccup: treat as anonymous rather than failing the whole request
    logger.warn({ err: (err as Error).message }, 'getSession failed')
  }
  c.set('user', s?.user ?? null)
  c.set('session', s?.session ?? null)
  await next()
})

export const requireUser = createMiddleware<SessionVars>(async (c, next) => {
  if (!c.get('user')) throw new ApiError(401, 'LOGIN_REQUIRED', 'Login required')
  await next()
})

export const requireAdmin = createMiddleware<SessionVars>(async (c, next) => {
  const u = c.get('user')
  if (!u || !u.emailVerified || !env.ADMIN_EMAILS.includes(u.email.toLowerCase())) {
    throw new ApiError(403, 'FORBIDDEN', 'Admin only')
  }
  await next()
})
