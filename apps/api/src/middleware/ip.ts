import { createHash } from 'node:crypto'
import type { Context } from 'hono'
import { env } from '../env'

/** Best-effort client IP: Vercel proxy header first, otherwise the last hop of x-forwarded-for. */
export function clientIp(c: Context): string {
  const vercel = c.req.header('x-vercel-forwarded-for')
  if (c.req.header('x-vercel-id') && vercel) return vercel.split(',')[0]!.trim()
  const xff = c.req.header('x-forwarded-for')
  if (xff) {
    const parts = xff
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return parts[parts.length - 1] ?? 'unknown'
  }
  return c.req.header('x-real-ip') ?? 'unknown'
}

/** Daily-salted hash so we never store raw IPs. */
export function clientIpHash(c: Context): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256')
    .update(`${env.DAILY_SEED_SECRET}:${day}:${clientIp(c)}`)
    .digest('hex')
    .slice(0, 32)
}
