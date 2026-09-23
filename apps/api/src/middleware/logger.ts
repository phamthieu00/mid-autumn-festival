import { createMiddleware } from 'hono/factory'
import { logger } from '../logger'
import { metrics } from '../metrics'

export const requestLogger = createMiddleware(async (c, next) => {
  const start = performance.now()
  await next()
  const ms = Math.round(performance.now() - start)
  const status = c.res.status
  const route = c.req.routePath === '/*' ? 'unmatched' : c.req.routePath
  metrics.httpRequests.inc({ method: c.req.method, route, status })
  metrics.httpDuration.observe(ms, { route })
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
