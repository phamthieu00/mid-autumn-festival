import { createMiddleware } from 'hono/factory'
import { redis, redisReady } from '../redis'
import { logger } from '../logger'
import { ApiError } from './error'
import { clientIp } from './ip'
import { metrics } from '../metrics'

const LUA = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[2]) end
return { c, redis.call('PTTL', KEYS[1]) }`

// in-memory fallback when Redis is unavailable (per instance, same limits)
const memory = new Map<string, { count: number; resetAt: number }>()
function memoryHit(key: string, windowMs: number) {
  const now = Date.now()
  const cur = memory.get(key)
  if (!cur || cur.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs })
    return { count: 1, ttlMs: windowMs }
  }
  cur.count++
  return { count: cur.count, ttlMs: cur.resetAt - now }
}
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
}, 60_000).unref()

export async function hit(
  key: string,
  windowMs: number,
): Promise<{ count: number; ttlMs: number }> {
  if (redisReady()) {
    try {
      const [count, ttl] = (await redis.eval(LUA, 1, key, '1', String(windowMs))) as [
        number,
        number,
      ]
      return { count, ttlMs: ttl }
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'rate limit redis failed; using memory')
    }
  }
  return memoryHit(key, windowMs)
}

export interface RateLimitOptions {
  scope: string
  /** limit per authenticated user (or per IP when anonymous) */
  limit: number
  windowMs: number
  /** extra, looser cap applied per IP even for logged-in users */
  perIpLimit?: number
}

export function rateLimit(opts: RateLimitOptions) {
  return createMiddleware<{ Variables: { user: { id: string } | null } }>(async (c, next) => {
    const user = c.get('user')
    const ip = clientIp(c)
    const subject = user ? `u:${user.id}` : `ip:${ip}`
    const r = await hit(`rl:v1:${opts.scope}:${subject}`, opts.windowMs)
    let over = r.count > opts.limit
    let ttl = r.ttlMs
    if (!over && user && opts.perIpLimit) {
      const ri = await hit(`rl:v1:${opts.scope}:ip:${ip}`, opts.windowMs)
      over = ri.count > opts.perIpLimit
      ttl = ri.ttlMs
    }
    if (over) {
      metrics.rateLimited.inc({ scope: opts.scope })
      c.header('Retry-After', String(Math.max(1, Math.ceil(ttl / 1000))))
      throw new ApiError(429, 'RATE_LIMITED', 'Too many requests')
    }
    await next()
  })
}
