import { describe, expect, it } from 'vitest'
import { createApp } from '../app'

describe('/api/metrics', () => {
  it('requires the bearer token and serves Prometheus text', async () => {
    const app = createApp()
    expect((await app.request('/api/metrics')).status).toBe(401)
    expect(
      (await app.request('/api/metrics', { headers: { authorization: 'Bearer nope' } })).status,
    ).toBe(401)
    const res = await app.request('/api/metrics', {
      headers: { authorization: 'Bearer test-metrics-token' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('# TYPE maf_http_requests_total counter')
    expect(text).toContain('maf_process_uptime_seconds')
  })
})
