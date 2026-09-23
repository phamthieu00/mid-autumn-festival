import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { sql } from '../db/client'
import { resetDb, seedUserWithSession } from '../test/db'
import { JOBS, runAllJobsOnce, runJob } from './index'

const app = createApp()
const post = (path: string, body: unknown, cookie?: string) =>
  app.request(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:5173',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  })
const json = async <T>(res: Response) => (await res.json()) as T

describe('background jobs', () => {
  beforeEach(resetDb)

  it('expires stale started sessions and purges old anonymous ones', async () => {
    const u = await seedUserWithSession()
    const mine = await json<{ sessionId: string }>(
      await post('/api/games/catch/sessions', {}, u.cookie),
    )
    await sql`update game_sessions set expires_at = now() - interval '1 minute' where id = ${mine.sessionId}`
    const fresh = await json<{ sessionId: string }>(
      await post('/api/games/catch/sessions', {}, u.cookie),
    )
    const old = await json<{ sessionId: string }>(await post('/api/games/runner/sessions', {}))
    await sql`update game_sessions set started_at = now() - interval '31 days', status = 'finished' where id = ${old.sessionId}`

    const out = await runAllJobsOnce()
    expect(out).toEqual({ expire_sessions: 1, purge_anonymous_sessions: 1 })
    const rows = await sql<
      { id: string; status: string }[]
    >`select id, status from game_sessions order by started_at`
    expect(rows.map((r) => r.status).sort()).toEqual(['expired', 'started'])
    expect(rows.find((r) => r.id === fresh.sessionId)?.status).toBe('started')
  })

  it('takes a Redis lock so only one instance runs a job per window', async () => {
    expect(await runJob(JOBS[0])).toBe(0)
    expect(await runJob(JOBS[0])).toBeNull()
  })
})
