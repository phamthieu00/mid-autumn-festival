import { createMiddleware } from 'hono/factory'
import { logger } from '../logger'

export const requestLogger = createMiddleware(async (c, next) => {
  const start = performance.now()
  await next()
  const ms = Math.round(performance.now() - start)
  const status = c.res.status
  const entry = {
    reqId: c.get('requestId'),
    method: c.req.method,
    route: c.req.routePath,
    path: c.req.path,
    status,
    ms,
  }
  if (status >= 500) logger.error(entry, 'request')
  else if (status >= 400) logger.warn(entry, 'request')
  else logger.info(entry, 'request')
})
