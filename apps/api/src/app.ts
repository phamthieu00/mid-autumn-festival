import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { bodyLimit } from 'hono/body-limit'
import { errorHandler } from './middleware/error'
import { requestLogger } from './middleware/logger'
import { healthRoutes } from './routes/health'
import { meRoutes } from './routes/me'
import { gameRoutes } from './routes/games'
import { leaderboardRoutes } from './routes/leaderboards'
import { dailyRoutes } from './routes/daily'
import { auth } from './auth'
import { sessionMiddleware, type SessionVars } from './middleware/session'
import { sameOriginGuard } from './middleware/sameOrigin'

export type AppEnv = SessionVars

export function createApp() {
  const app = new Hono<AppEnv>()

  app.use(requestId())
  app.use(requestLogger)
  app.use(secureHeaders())
  app.use('/api/*', bodyLimit({ maxSize: 16 * 1024 }))

  app.route('/api', healthRoutes)
  app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  app.use('/api/*', sessionMiddleware)
  app.use('/api/*', sameOriginGuard)
  app.route('/api', meRoutes)
  app.route('/api', gameRoutes)
  app.route('/api', leaderboardRoutes)
  app.route('/api', dailyRoutes)

  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404))
  app.onError(errorHandler)
  return app
}

export type App = ReturnType<typeof createApp>
