import { and, eq, isNull, lt, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { gameSessions } from '../db/schema/index'
import { logger } from '../logger'
import { metrics } from '../metrics'
import { safeRedis } from '../redis'

export interface Job {
  name: string
  everyMs: number
  run: () => Promise<number>
}

export const JOBS: Job[] = [
  {
    // started sessions past their TTL: mark expired so stats and admin views stay honest
    name: 'expire_sessions',
    everyMs: 5 * 60_000,
    run: async () => {
      const rows = await db
        .update(gameSessions)
        .set({ status: 'expired' })
        .where(and(eq(gameSessions.status, 'started'), lt(gameSessions.expiresAt, sql`now()`)))
        .returning({ id: gameSessions.id })
      return rows.length
    },
  },
  {
    // anonymous play is kept 30 days (share cards), then purged; scores cascade with the session
    name: 'purge_anonymous_sessions',
    everyMs: 60 * 60_000,
    run: async () => {
      const rows = await db
        .delete(gameSessions)
        .where(
          and(
            isNull(gameSessions.userId),
            lt(gameSessions.startedAt, sql`now() - interval '30 days'`),
          ),
        )
        .returning({ id: gameSessions.id })
      return rows.length
    },
  },
]

/** Runs one job unless another instance holds the Redis lock for this window. */
export async function runJob(job: Job): Promise<number | null> {
  const lockTtl = Math.max(1_000, job.everyMs - 5_000)
  const locked = await safeRedis(
    (r) => r.set(`jobs:lock:v1:${job.name}`, String(process.pid), 'PX', lockTtl, 'NX'),
    'OK',
  )
  if (locked !== 'OK') return null
  const started = Date.now()
  try {
    const affected = await job.run()
    metrics.jobsRun.inc({ job: job.name, result: 'ok' })
    logger.info({ job: job.name, affected, ms: Date.now() - started }, 'job done')
    return affected
  } catch (err) {
    metrics.jobsRun.inc({ job: job.name, result: 'error' })
    logger.error({ job: job.name, err }, 'job failed')
    return null
  }
}

/** Test helper: every job, no lock. */
export async function runAllJobsOnce() {
  const out: Record<string, number> = {}
  for (const job of JOBS) out[job.name] = await job.run()
  return out
}

const timers: NodeJS.Timeout[] = []

export function startJobs() {
  for (const job of JOBS) {
    const t = setInterval(() => void runJob(job), job.everyMs)
    t.unref()
    timers.push(t)
  }
  // first pass shortly after boot, staggered so instances don't stampede
  const boot = setTimeout(
    () => {
      for (const job of JOBS) void runJob(job)
    },
    15_000 + Math.random() * 10_000,
  )
  boot.unref()
  timers.push(boot)
}

export function stopJobs() {
  for (const t of timers) clearInterval(t)
  timers.length = 0
}
