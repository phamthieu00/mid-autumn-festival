import { serve } from '@hono/node-server'
import { createApp } from './app'
import { env } from './env'
import { logger } from './logger'
import { connectRedis, redis } from './redis'
import { sql } from './db/client'
import { closeWishStream } from './services/wishStream'
import { startJobs, stopJobs } from './jobs/index'

const app = createApp()

await connectRedis()
startJobs()

const server = serve({ fetch: app.fetch, port: env.PORT, hostname: '::' }, (info) => {
  logger.info({ port: info.port, env: env.NODE_ENV }, 'api listening')
})

let shuttingDown = false
async function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'shutting down')
  stopJobs()
  const timer = setTimeout(() => process.exit(1), 10_000)
  server.close(async () => {
    try {
      await Promise.allSettled([closeWishStream(), redis.quit(), sql.end({ timeout: 5 })])
    } finally {
      clearTimeout(timer)
      process.exit(0)
    }
  })
}
process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
