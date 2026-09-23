import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { resetDb, seedUserWithSession } from '../test/db'

const app = createApp()
const ORIGIN = 'http://localhost:5173'
const post = (path: string, body: unknown, cookie?: string, extra: Record<string, string> = {}) =>
  app.request(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: ORIGIN,
      ...(cookie ? { cookie } : {}),
      ...extra,
    },
    body: JSON.stringify(body),
  })
const json = async <T>(res: Response) => (await res.json()) as T
type Wish = { id: string; displayName: string; status: string; text: string; mine: boolean }

describe('wishes', () => {
  beforeEach(resetDb)

  it('anonymous wish is published and listed', async () => {
    const res = await post('/api/wishes', { text: '  Mong  trăng tròn  ', color: 'gold' })
    expect(res.status).toBe(201)
    const { wish } = await json<{ wish: Wish }>(res)
    expect(wish).toMatchObject({
      displayName: 'Ai đó',
      status: 'visible',
      text: 'Mong trăng tròn',
      mine: true,
    })
    const list = await json<{ items: Wish[]; nextCursor: string | null }>(
      await app.request('/api/wishes?limit=10'),
    )
    expect(list.items.map((w) => w.id)).toEqual([wish.id])
    expect(list.nextCursor).toBeNull()
  })

  it('blocks profanity and links, sends soft words to moderation (visible only to the author)', async () => {
    expect((await post('/api/wishes', { text: 'đ.ị.t mẹ', color: 'red' })).status).toBe(400)
    expect(
      (await post('/api/wishes', { text: 'ghé www.casino.com nhé', color: 'red' })).status,
    ).toBe(400)
    const u = await seedUserWithSession({ name: 'Cuội' })
    const soft = await json<{ wish: Wish }>(
      await post(
        '/api/wishes',
        { text: 'Thằng ngu kia chúc mừng trung thu', color: 'red' },
        u.cookie,
      ),
    )
    expect(soft.wish.status).toBe('pending')
    const anon = await json<{ items: Wish[]; pending: Wish[] }>(await app.request('/api/wishes'))
    expect(anon.items).toHaveLength(0)
    const mine = await json<{ items: Wish[]; pending: Wish[] }>(
      await app.request('/api/wishes', { headers: { cookie: u.cookie } }),
    )
    expect(mine.pending.map((w) => w.id)).toEqual([soft.wish.id])
  })

  it('paginates with a cursor, newest first', async () => {
    for (let i = 0; i < 5; i++) await post('/api/wishes', { text: `wish ${i}`, color: 'pink' })
    const p1 = await json<{ items: Wish[]; nextCursor: string }>(
      await app.request('/api/wishes?limit=3'),
    )
    expect(p1.items.map((w) => w.text)).toEqual(['wish 4', 'wish 3', 'wish 2'])
    const p2 = await json<{ items: Wish[]; nextCursor: string | null }>(
      await app.request(`/api/wishes?limit=3&cursor=${p1.nextCursor}`),
    )
    expect(p2.items.map((w) => w.text)).toEqual(['wish 1', 'wish 0'])
    expect(p2.nextCursor).toBeNull()
  })

  it('three distinct reports hide a wish pending review; admins can restore it', async () => {
    const { wish } = await json<{ wish: Wish }>(
      await post('/api/wishes', { text: 'hmm', color: 'red' }),
    )
    const reporters = await Promise.all([
      seedUserWithSession(),
      seedUserWithSession(),
      seedUserWithSession(),
    ])
    for (const r of reporters)
      expect(
        (await post(`/api/wishes/${wish.id}/report`, { reason: 'spam' }, r.cookie)).status,
      ).toBe(200)
    const dup = await json<{ duplicate: boolean }>(
      await post(`/api/wishes/${wish.id}/report`, {}, reporters[0].cookie),
    )
    expect(dup.duplicate).toBe(true)
    expect((await json<{ items: Wish[] }>(await app.request('/api/wishes'))).items).toHaveLength(0)

    const nobody = await seedUserWithSession()
    expect(
      (await app.request('/api/admin/wishes', { headers: { cookie: nobody.cookie } })).status,
    ).toBe(403)
    const admin = await seedUserWithSession({ email: 'admin@example.com' })
    const pending = await json<{ items: Wish[] }>(
      await app.request('/api/admin/wishes?status=pending', { headers: { cookie: admin.cookie } }),
    )
    expect(pending.items.map((w) => w.id)).toEqual([wish.id])
    const restored = await app.request(`/api/admin/wishes/${wish.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', origin: ORIGIN, cookie: admin.cookie },
      body: JSON.stringify({ status: 'visible' }),
    })
    expect(restored.status).toBe(200)
    expect((await json<{ items: Wish[] }>(await app.request('/api/wishes'))).items).toHaveLength(1)
  })
})

describe('wishes stream', () => {
  beforeEach(resetDb)

  it('replays nothing for a fresh client, then pushes new wishes as SSE events', async () => {
    const res = await app.request('/api/wishes/stream')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
    const reader = res.body!.getReader()
    const dec = new TextDecoder()
    let buf = ''
    const readUntil = async (pred: (s: string) => boolean, ms = 4000) => {
      const deadline = Date.now() + ms
      while (!pred(buf) && Date.now() < deadline) {
        const chunk = await Promise.race([
          reader.read(),
          new Promise<{ value: undefined; done: true }>((r) =>
            setTimeout(
              () => r({ value: undefined, done: true }),
              Math.max(1, deadline - Date.now()),
            ),
          ),
        ])
        if (chunk.done) break
        buf += dec.decode(chunk.value)
      }
      return pred(buf)
    }
    expect(await readUntil((s) => s.includes('event: ready'))).toBe(true)
    expect(buf).not.toContain('event: wish')

    const created = await post('/api/wishes', { text: 'Đèn realtime bay lên', color: 'red' })
    expect(created.status).toBe(201)
    expect(
      await readUntil((s) => s.includes('event: wish') && s.includes('Đèn realtime bay lên')),
    ).toBe(true)
    await reader.cancel()
  })
})
