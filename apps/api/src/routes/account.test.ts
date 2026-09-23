import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { sql } from '../db/client'
import { resetDb, seedUserWithSession } from '../test/db'

const app = createApp()
const ORIGIN = 'http://localhost:5173'
const send = (method: string, path: string, body: unknown, cookie?: string) =>
  app.request(path, {
    method,
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
const json = async <T>(res: Response) => (await res.json()) as T
const backdate = (sessionId: string, sec: number) =>
  sql`update game_sessions set started_at = now() - make_interval(secs => ${sec}) where id = ${sessionId}`

describe('account export and deletion', () => {
  beforeEach(resetDb)

  it('exports everything, then deletes the account: scores leave the board, wishes turn anonymous', async () => {
    const u = await seedUserWithSession({ name: 'Cuội' })
    expect((await send('PATCH', '/api/me', { nickname: 'Cuội Chơi' }, u.cookie)).status).toBe(200)

    const s = await json<{ sessionId: string }>(
      await send('POST', '/api/games/catch/sessions', { mode: 'free' }, u.cookie),
    )
    await backdate(s.sessionId, 61)
    const fin = await json<{ publicId: string; ranks: { alltime: number } }>(
      await send(
        'POST',
        `/api/sessions/${s.sessionId}/finish`,
        { score: 42, counts: { lantern: 30, golden: 3, cloud: 2 }, maxCombo: 9 },
        u.cookie,
      ),
    )
    expect(fin.ranks.alltime).toBe(1)
    const { wish } = await json<{ wish: { id: string; displayName: string } }>(
      await send('POST', '/api/wishes', { text: 'Trăng tròn cho cả nhà', color: 'gold' }, u.cookie),
    )
    expect(wish.displayName).toBe('Cuội Chơi')

    const exp = await app.request('/api/me/export', { headers: { cookie: u.cookie } })
    expect(exp.status).toBe(200)
    expect(exp.headers.get('content-disposition')).toContain('attachment')
    const data = await json<{
      account: { email: string }
      player: { nickname: string }
      scores: unknown[]
      wishes: unknown[]
      badges: unknown[]
      sessions: unknown[]
    }>(exp)
    expect(data.account.email).toBe(u.email)
    expect(data.player.nickname).toBe('Cuội Chơi')
    expect(data.scores).toHaveLength(1)
    expect(data.wishes).toHaveLength(1)
    expect(data.sessions).toHaveLength(1)
    expect(data.badges.length).toBeGreaterThan(0)

    expect((await app.request('/api/me/export')).status).toBe(401)
    expect(
      (
        await app.request('/api/me', {
          method: 'DELETE',
          headers: { origin: 'https://evil.example', cookie: u.cookie },
        })
      ).status,
    ).toBe(403)

    const del = await app.request('/api/me?lang=vi', {
      method: 'DELETE',
      headers: { origin: ORIGIN, cookie: u.cookie },
    })
    expect(del.status).toBe(200)
    expect(del.headers.get('set-cookie')).toContain('maf.session_token=;')

    const me = await json<{ user: unknown }>(
      await app.request('/api/me', { headers: { cookie: u.cookie } }),
    )
    expect(me.user).toBeNull()
    const lb = await json<{ entries: unknown[] }>(
      await app.request('/api/leaderboards/catch?period=alltime'),
    )
    expect(lb.entries).toEqual([])
    expect((await app.request(`/api/results/${fin.publicId}`)).status).toBe(404)
    expect((await app.request(`/api/players/${u.id}`)).status).toBe(404)
    const list = await json<{ items: { id: string; displayName: string; status: string }[] }>(
      await app.request('/api/wishes'),
    )
    expect(list.items).toHaveLength(1)
    expect(list.items[0]).toMatchObject({ id: wish.id, displayName: 'Ẩn danh', status: 'visible' })
    const users = await sql`select count(*)::int as n from "user" where id = ${u.id}`
    expect(users[0].n).toBe(0)
  })
})
