import { beforeEach, describe, expect, it } from 'vitest'
import { generateChart } from '@maf/shared/games/rhythm/chart'
import { pickEntries } from '@maf/shared/games/word/wordReducer'
import { baseLetter } from '@maf/shared/games/word/normalize'
import { seededRng } from '@maf/shared/random'
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

/** Pretend the session started `sec` seconds ago so the elapsed-time rules pass. */
const backdate = (sessionId: string, sec: number) =>
  sql`update game_sessions set started_at = now() - make_interval(secs => ${sec}) where id = ${sessionId}`

describe('game sessions', () => {
  beforeEach(resetDb)

  it('anonymous free session: start → finish → accepted with a share id but no rank', async () => {
    const start = await post('/api/games/catch/sessions', { mode: 'free' })
    expect(start.status).toBe(201)
    const s = await json<{ sessionId: string; seed: number; expiresAt: string }>(start)
    expect(s.seed).toBeGreaterThan(0)
    await backdate(s.sessionId, 61)
    const fin = await post(`/api/sessions/${s.sessionId}/finish`, {
      score: 42,
      counts: { lantern: 30, golden: 3, cloud: 2 },
      maxCombo: 9,
    })
    expect(fin.status).toBe(200)
    const r = await json<{
      accepted: boolean
      value: number
      publicId: string
      anonymous: boolean
      ranks: { alltime: null }
    }>(fin)
    expect(r.accepted).toBe(true)
    expect(r.value).toBe(42)
    expect(r.publicId).toHaveLength(10)
    expect(r.anonymous).toBe(true)
    expect(r.ranks.alltime).toBeNull()
  })

  it('rejects impossible scores and too-fast finishes, and finishes only once', async () => {
    const s = await json<{ sessionId: string }>(await post('/api/games/catch/sessions', {}))
    const fast = await post(`/api/sessions/${s.sessionId}/finish`, {
      score: 1,
      counts: { lantern: 1, golden: 0, cloud: 0 },
      maxCombo: 1,
    })
    expect(fast.status).toBe(422)
    expect((await json<{ error: { message: string } }>(fast)).error.message).toBe('TOO_FAST')
    // rejected sessions are closed
    const again = await post(`/api/sessions/${s.sessionId}/finish`, {
      score: 1,
      counts: { lantern: 1, golden: 0, cloud: 0 },
      maxCombo: 1,
    })
    expect(again.status).toBe(409)

    const s2 = await json<{ sessionId: string }>(await post('/api/games/catch/sessions', {}))
    await backdate(s2.sessionId, 61)
    const cheat = await post(`/api/sessions/${s2.sessionId}/finish`, {
      score: 9999,
      counts: { lantern: 5, golden: 0, cloud: 0 },
      maxCombo: 5,
    })
    expect(cheat.status).toBe(422)
  })

  it('expired sessions are refused with 410', async () => {
    const s = await json<{ sessionId: string }>(await post('/api/games/runner/sessions', {}))
    await sql`update game_sessions set expires_at = now() - interval '1 minute' where id = ${s.sessionId}`
    const res = await post(`/api/sessions/${s.sessionId}/finish`, {
      metres: 10,
      pickups: { mooncake: 0, star: 0 },
    })
    expect(res.status).toBe(410)
  })

  it('rhythm is replayed from the seed and the server score is authoritative', async () => {
    const s = await json<{ sessionId: string; seed: number }>(
      await post('/api/games/rhythm/sessions', {}),
    )
    const chart = generateChart(s.seed)
    await backdate(s.sessionId, 60)
    const res = await post(`/api/sessions/${s.sessionId}/finish`, {
      judgements: chart.notes.map(() => 2),
    })
    expect(res.status).toBe(200)
    const r = await json<{ value: number }>(res)
    expect(r.value).toBeGreaterThan(chart.notes.length * 100)
  })

  it('quiz: questions come without answers, answers are graded server-side', async () => {
    const start = await json<{
      sessionId: string
      quiz: { id: string; options: unknown[]; correctIndex?: number }[]
    }>(await post('/api/games/quiz/sessions', {}))
    expect(start.quiz).toHaveLength(10)
    expect(start.quiz.every((q) => q.correctIndex === undefined)).toBe(true)
    let correct = 0
    for (let i = 0; i < 10; i++) {
      const a = await post(`/api/sessions/${start.sessionId}/answer`, { index: i, option: 0 })
      expect(a.status).toBe(200)
      const body = await json<{
        correct: boolean
        correctIndex: number
        explanation: { vi: string }
      }>(a)
      expect(body.correctIndex).toBeGreaterThanOrEqual(0)
      expect(body.explanation.vi.length).toBeGreaterThan(0)
      if (body.correct) correct++
    }
    const dup = await post(`/api/sessions/${start.sessionId}/answer`, { index: 0, option: 1 })
    expect(dup.status).toBe(409)
    await backdate(start.sessionId, 40)
    const fin = await json<{ value: number; secondary: number }>(
      await post(`/api/sessions/${start.sessionId}/finish`, {}),
    )
    expect(fin.value).toBe(correct)
    expect(fin.secondary).toBeGreaterThanOrEqual(40)
  })

  it('logged-in players get personal bests, ranks and a leaderboard entry', async () => {
    const u = await seedUserWithSession({ name: 'Hằng' })
    await post('/api/me', {}, u.cookie) // noop but proves the cookie
    const s1 = await json<{ sessionId: string; seed: number }>(
      await post('/api/games/word/sessions', {}, u.cookie),
    )
    await backdate(s1.sessionId, 30)
    const entries = pickEntries(seededRng(s1.seed))
    const rounds = entries.map((e) => ({
      guessed: [...new Set([...e.word].filter((c) => c !== ' ').map(baseLetter))],
    }))
    const r1 = await json<{
      value: number
      isPersonalBest: boolean
      ranks: { alltime: number | null; weekly: number | null }
    }>(await post(`/api/sessions/${s1.sessionId}/finish`, { rounds }, u.cookie))
    expect(r1.value).toBe(80)
    expect(r1.isPersonalBest).toBe(true)
    expect(r1.ranks.alltime).toBe(1)
    expect(r1.ranks.weekly).toBe(1)

    const board = await json<{
      entries: { userId: string; rank: number; value: number; nickname: string | null }[]
      me: { rank: number } | null
    }>(
      await app.request('/api/leaderboards/word?period=alltime', { headers: { cookie: u.cookie } }),
    )
    expect(board.entries).toHaveLength(1)
    expect(board.entries[0]).toMatchObject({ userId: u.id, rank: 1, value: r1.value })
    expect(board.me?.rank).toBe(1)
  })

  it('daily mode needs login, uses the same seed for everyone and allows one finished run per day', async () => {
    const anon = await post('/api/games/puzzle/sessions', { mode: 'daily' })
    expect(anon.status).toBe(401)
    const a = await seedUserWithSession()
    const b = await seedUserWithSession()
    const sa = await json<{ sessionId: string; seed: number; dailyKey: string }>(
      await post('/api/games/match/sessions', { mode: 'daily' }, a.cookie),
    )
    const sb = await json<{ sessionId: string; seed: number }>(
      await post('/api/games/match/sessions', { mode: 'daily' }, b.cookie),
    )
    expect(sa.seed).toBe(sb.seed)
    expect(sa.dailyKey).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    await backdate(sa.sessionId, 50)
    const fin = await post(
      `/api/sessions/${sa.sessionId}/finish`,
      { moves: 14, seconds: 45 },
      a.cookie,
    )
    expect(fin.status).toBe(200)
    expect((await json<{ ranks: { daily: number } }>(fin)).ranks.daily).toBe(1)
    const second = await post('/api/games/match/sessions', { mode: 'daily' }, a.cookie)
    expect(second.status).toBe(409)
    const daily = await json<{
      challenges: { gameId: string; done: boolean; myRank: number | null }[]
    }>(await app.request('/api/daily', { headers: { cookie: a.cookie } }))
    const match = daily.challenges.find((c) => c.gameId === 'match')!
    expect(match.done).toBe(true)
    expect(match.myRank).toBe(1)
  })
})
