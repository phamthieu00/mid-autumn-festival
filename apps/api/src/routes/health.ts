import { Hono } from 'hono'
import { sql } from '../db/client'
import { redis, redisReady } from '../redis'

const withTimeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

const startedAt = Date.now()

export const healthRoutes = new Hono().get('/health', async (c) => {
  const dbUp = await withTimeout(sql`select 1`, 1000)
    .then(() => true)
    .catch(() => false)
  const redisUp = redisReady()
    ? await withTimeout(redis.ping(), 300)
        .then((r) => r === 'PONG')
        .catch(() => false)
    : false
  const body = {
    ok: dbUp,
    db: dbUp ? 'up' : 'down',
    redis: redisUp ? 'up' : 'down',
    degraded: dbUp && !redisUp,
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
    version: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
  }
  return c.json(body, dbUp ? 200 : 503)
})
