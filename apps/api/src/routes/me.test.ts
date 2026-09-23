import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { resetDb, seedUserWithSession } from '../test/db'

const app = createApp()
const json = (body: unknown, cookie?: string) =>
  ({
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:5173',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  }) as RequestInit

describe('/api/me', () => {
  beforeEach(resetDb)

  it('is anonymous without a session', async () => {
    const res = await app.request('/api/me')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ user: null, player: null })
  })

  it('returns the player for a valid session cookie', async () => {
    const u = await seedUserWithSession({ name: 'Cuội' })
    const res = await app.request('/api/me', { headers: { cookie: u.cookie } })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { user: { id: string }; player: { nickname: string | null } }
    expect(body.user.id).toBe(u.id)
    expect(body.player.nickname).toBeNull()
  })

  it('requires login and same-origin for PATCH', async () => {
    const anon = await app.request('/api/me', json({ nickname: 'Thỏ Ngọc' }))
    expect(anon.status).toBe(401)
    const u = await seedUserWithSession()
    const cross = await app.request('/api/me', {
      ...json({ nickname: 'x' }, u.cookie),
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.example',
        cookie: u.cookie,
      },
    })
    expect(cross.status).toBe(403)
  })

  it('sets a nickname, rejects duplicates (case-insensitive) and reserved names', async () => {
    const a = await seedUserWithSession()
    const b = await seedUserWithSession()
    const ok = await app.request('/api/me', json({ nickname: '  Chị  Hằng 2026 ' }, a.cookie))
    expect(ok.status).toBe(200)
    expect(((await ok.json()) as { player: { nickname: string } }).player.nickname).toBe(
      'Chị Hằng 2026',
    )
    const dup = await app.request('/api/me', json({ nickname: 'chị hằng 2026' }, b.cookie))
    expect(dup.status).toBe(409)
    const reserved = await app.request('/api/me', json({ nickname: 'Ad_min' }, b.cookie))
    expect(reserved.status).toBe(409)
    const tooShort = await app.request('/api/me', json({ nickname: 'ab' }, b.cookie))
    expect(tooShort.status).toBe(400)
  })
})
