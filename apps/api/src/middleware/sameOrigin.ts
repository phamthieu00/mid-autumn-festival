import { createMiddleware } from 'hono/factory'
import { env } from '../env'
import { ApiError } from './error'

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** Defence-in-depth CSRF guard for our own JSON endpoints (better-auth guards its own routes). */
export const sameOriginGuard = createMiddleware(async (c, next) => {
  if (!UNSAFE.has(c.req.method)) return next()
  const site = c.req.header('sec-fetch-site')
  const origin = c.req.header('origin')
  const ok = site
    ? site === 'same-origin' || site === 'none'
    : !origin || origin === env.PUBLIC_ORIGIN
  if (!ok) throw new ApiError(403, 'CROSS_SITE', 'Cross-site request blocked')
  const ct = c.req.header('content-type') ?? ''
  if (
    c.req.header('content-length') !== '0' &&
    !ct.startsWith('application/json') &&
    c.req.method !== 'DELETE'
  ) {
    throw new ApiError(400, 'BAD_CONTENT_TYPE', 'Expected application/json')
  }
  return next()
})
