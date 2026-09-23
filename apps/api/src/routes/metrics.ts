import { Hono } from 'hono'
import { env } from '../env'
import { ApiError } from '../middleware/error'
import { renderMetrics } from '../metrics'

/** Prometheus scrape endpoint; hidden (404) unless METRICS_TOKEN is configured. */
export const metricsRoutes = new Hono().get('/metrics', (c) => {
  if (!env.METRICS_TOKEN) throw new ApiError(404, 'NOT_FOUND')
  const header = c.req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : c.req.query('token')
  if (token !== env.METRICS_TOKEN) throw new ApiError(401, 'UNAUTHORIZED')
  c.header('Cache-Control', 'no-store')
  return c.text(renderMetrics(), 200, {
    'content-type': 'text/plain; version=0.0.4; charset=utf-8',
  })
})
