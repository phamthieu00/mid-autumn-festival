import { EventEmitter } from 'node:events'
import { redis, redisReady, safeRedis } from '../redis'
import { logger } from '../logger'

export interface WishEvent {
  id: string
  createdAt: string
  displayName: string
  text: string
  color: string
  lang: string
}

const CHANNEL = 'wishes:new'
const RECENT_KEY = 'wishes:recent:v1'
const RECENT_CAP = 100

const local = new EventEmitter()
local.setMaxListeners(0)
let subscriber: ReturnType<typeof redis.duplicate> | null = null

/** Fan out to every instance through Redis; falls back to in-process events. */
export async function publishWish(ev: WishEvent) {
  const payload = JSON.stringify(ev)
  await safeRedis(async (r) => {
    await r
      .multi()
      .publish(CHANNEL, payload)
      .lpush(RECENT_KEY, payload)
      .ltrim(RECENT_KEY, 0, RECENT_CAP - 1)
      .exec()
  }, null)
  if (!redisReady()) local.emit('wish', ev)
}

function ensureSubscriber() {
  if (subscriber || !redisReady()) return
  // The main client rejects commands while connecting (no offline queue); the pub/sub connection
  // must instead connect eagerly and queue SUBSCRIBE until it is ready, or nothing ever arrives.
  subscriber = redis.duplicate({
    lazyConnect: false,
    enableOfflineQueue: true,
    commandTimeout: undefined,
  })
  subscriber.on('ready', () => logger.info('wish subscriber ready'))
  subscriber.on('message', (_ch, msg) => {
    try {
      local.emit('wish', JSON.parse(msg) as WishEvent)
    } catch {
      /* ignore malformed */
    }
  })
  subscriber.on('error', (err) => logger.warn({ err: err.message }, 'wish subscriber error'))
  subscriber
    .subscribe(CHANNEL)
    .catch((err) => logger.warn({ err: (err as Error).message }, 'subscribe failed'))
}

export function subscribeWishes(cb: (ev: WishEvent) => void): () => void {
  ensureSubscriber()
  local.on('wish', cb)
  return () => local.off('wish', cb)
}

/** Events newer than `lastEventId` (a wish id), oldest first, for SSE reconnects. */
export async function replaySince(lastEventId: string | undefined): Promise<WishEvent[]> {
  const raw = await safeRedis((r) => r.lrange(RECENT_KEY, 0, RECENT_CAP - 1), [] as string[])
  const events = raw
    .map((s) => {
      try {
        return JSON.parse(s) as WishEvent
      } catch {
        return null
      }
    })
    .filter((e): e is WishEvent => !!e)
    .reverse()
  if (!lastEventId) return []
  const idx = events.findIndex((e) => e.id === lastEventId)
  return idx >= 0 ? events.slice(idx + 1) : []
}

export async function closeWishStream() {
  await subscriber?.quit().catch(() => {})
  subscriber = null
}
