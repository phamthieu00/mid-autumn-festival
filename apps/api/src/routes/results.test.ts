import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { sql } from '../db/client'
import { resetDb, seedUserWithSession } from '../test/db'

const app = createApp()
const ORIGIN = 'http://localhost:5173'
const post = (path: string, body: unknown, cookie?: string) =>
  app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  })
const json = async <T>(res: Response) => (await res.json()) as T

async function playCatch(cookie?: string, score = 42) {
  const s = await json<{ sessionId: string }>(await post('/api/games/catch/sessions', {}, cookie))
  await sql`update game_sessions set started_at = now() - interval '61 seconds' where id = ${s.sessionId}`
  return json<{ publicId: string; newBadges: string[] }>(
    await post(
      `/api/sessions/${s.sessionId}/finish`,
      { score, counts: { lantern: 30, golden: 3, cloud: 2 }, maxCombo: 9 },
      cookie,
    ),
  )
}

describe('results, share page, OG image, profiles, badges', () => {
  beforeEach(resetDb)

  it('serves the result JSON, an OG PNG and a crawler-friendly share page', async () => {
    const { publicId } = await playCatch()
    const r = await json<{ value: number; player: null; rank: null }>(
      await app.request(`/api/results/${publicId}`),
    )
    expect(r.value).toBe(42)
    expect(r.player).toBeNull()

    const png = await app.request(`/api/og/results/${publicId}.png`)
    expect(png.status).toBe(200)
    expect(png.headers.get('content-type')).toBe('image/png')
    const bytes = new Uint8Array(await png.arrayBuffer())
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47])
    expect(bytes.byteLength).toBeGreaterThan(10_000)

    const html = await app.request(`/r/${publicId}`)
    expect(html.status).toBe(200)
    const body = await html.text()
    expect(body).toContain('og:image')
    expect(body).toContain(`/api/og/results/${publicId}.png`)
    expect(body).toContain('Bắt lồng đèn')
    expect(body).toContain(`/results/${publicId}`)

    expect((await app.request('/api/results/nope')).status).toBe(404)
  })

  it('awards badges on finish and exposes them on the public profile and /me', async () => {
    const u = await seedUserWithSession({ name: 'Thỏ' })
    const first = await playCatch(u.cookie, 55)
    expect(first.newBadges.sort()).toEqual(['catch-50', 'first-game', 'weekly-top-10'])
    const again = await playCatch(u.cookie, 60)
    expect(again.newBadges).toEqual([])

    const profile = await json<{
      nickname: string | null
      totalGames: number
      bests: { gameId: string; value: number | null; rank: number | null }[]
      badges: { badgeId: string }[]
    }>(await app.request(`/api/players/${u.id}`))
    expect(profile.totalGames).toBe(2)
    expect(profile.bests.find((b) => b.gameId === 'catch')).toMatchObject({ value: 60, rank: 1 })
    expect(profile.badges.map((b) => b.badgeId).sort()).toEqual([
      'catch-50',
      'first-game',
      'weekly-top-10',
    ])

    const me = await json<{ badges: { badgeId: string }[]; isAdmin: boolean }>(
      await app.request('/api/me', { headers: { cookie: u.cookie } }),
    )
    expect(me.badges).toHaveLength(3)
    expect(me.isAdmin).toBe(false)
    expect((await app.request('/api/players/u_missing')).status).toBe(404)
  })
})
