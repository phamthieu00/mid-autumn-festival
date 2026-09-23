import { Redis } from 'ioredis'
import { env } from './env'
import { logger } from './logger'

function withDualStack(url: string) {
  // Railway private networking is IPv6-only; ioredis needs family=0 to resolve *.railway.internal
  if (url.includes('.railway.internal') && !url.includes('family=')) {
    return url + (url.includes('?') ? '&' : '?') + 'family=0'
  }
  return url
}

export const redis = new Redis(withDualStack(env.REDIS_URL), {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  commandTimeout: 500,
  connectTimeout: 3000,
  retryStrategy: (times) => Math.min(5000, 200 * 2 ** Math.min(times, 5)),
})

redis.on('error', (err) => logger.warn({ err: err.message }, 'redis error'))
redis.on('ready', () => logger.info('redis ready'))
redis.on('end', () => logger.warn('redis connection closed'))

export const redisReady = () => redis.status === 'ready'

export async function connectRedis() {
  try {
    await redis.connect()
  } catch (err) {
    logger.warn(
      { err: (err as Error).message },
      'redis initial connect failed; continuing degraded',
    )
  }
}

/** Run a redis command, returning `fallback` when redis is unavailable or errors. */
export async function safeRedis<T>(fn: (r: Redis) => Promise<T>, fallback: T): Promise<T> {
  if (!redisReady()) return fallback
  try {
    return await fn(redis)
  } catch (err) {
    logger.warn({ err: (err as Error).message }, 'redis command failed')
    return fallback
  }
}
