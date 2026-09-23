import { describe, expect, it } from 'vitest'
import { createApp } from './app'

describe('app', () => {
  it('returns 404 JSON for unknown routes', async () => {
    const app = createApp()
    const res = await app.request('/api/nope')
    expect(res.status).toBe(404)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('NOT_FOUND')
    expect(res.headers.get('x-request-id')).toBeTruthy()
  })
})
